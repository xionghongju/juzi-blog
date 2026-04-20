#!/bin/bash
# AI 开发守卫 - 文件保存时自动执行：安全扫描 + 代码审查 + 生成单元测试

set -euo pipefail

ENV_FILE="$(dirname "$0")/../dev-guard.env"
LOG_FILE="$(dirname "$0")/../dev-guard.log"

# 加载配置
if [ ! -f "$ENV_FILE" ]; then
  echo "[dev-guard] 未找到配置文件: $ENV_FILE" >> "$LOG_FILE"
  exit 0
fi
source "$ENV_FILE"

if [ -z "${GH_TOKEN:-}" ]; then
  echo "[dev-guard] GH_TOKEN 未配置，跳过检查" >> "$LOG_FILE"
  exit 0
fi

# 从 stdin 读取 Claude hook 上下文
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# 只处理源代码文件
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.py|*.go|*.rs|*.sql) ;;
  *) exit 0 ;;
esac

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_NAME=$(basename "$FILE_PATH")
FILE_CONTENT=$(head -c 6000 "$FILE_PATH" 2>/dev/null)

if [ -z "$FILE_CONTENT" ]; then
  exit 0
fi

echo "[dev-guard] $(date '+%H:%M:%S') ▶ $FILE_NAME (触发: $TOOL_NAME)" >> "$LOG_FILE"

# ─── 工具函数：调用 GitHub Models API ───────────────────────────────────────
call_ai() {
  local prompt="$1"
  local out_file="$2"
  local use_json="${3:-false}"

  local payload
  if [ "$use_json" = "true" ]; then
    payload=$(jq -n --arg p "$prompt" --arg m "$GH_MODELS_MODEL" \
      '{model: $m, messages: [{role:"user", content: $p}], max_tokens: 600, response_format: {type: "json_object"}}')
  else
    payload=$(jq -n --arg p "$prompt" --arg m "$GH_MODELS_MODEL" \
      '{model: $m, messages: [{role:"user", content: $p}], max_tokens: 800}')
  fi

  local status
  status=$(curl -s -o "$out_file" -w "%{http_code}" \
    --retry 2 --max-time 30 \
    "$GH_MODELS_URL" \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "content-type: application/json" \
    -d "$payload" 2>/dev/null)

  echo "$status"
}

# ─── 工具函数：创建 GitHub Issue ────────────────────────────────────────────
create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  local payload
  payload=$(jq -n --arg t "$title" --arg b "$body" \
    --argjson l "$labels" \
    '{title: $t, body: $b, labels: $l}')

  local resp_file="/tmp/dev-guard-issue-resp.json"
  local status
  status=$(curl -s -o "$resp_file" -w "%{http_code}" \
    --max-time 15 \
    "https://api.github.com/repos/$GH_OWNER/$GH_REPO/issues" \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "content-type: application/json" \
    -d "$payload" 2>/dev/null)

  if [ "$status" = "201" ]; then
    jq -r '.html_url' "$resp_file" 2>/dev/null
  fi
  rm -f "$resp_file"
}

# ════════════════════════════════════════════════════════════════════════════
# 1. 安全扫描（Security Auditor）
# ════════════════════════════════════════════════════════════════════════════
SECURITY_PROMPT="你是安全审查专家。扫描以下代码，只输出 JSON。
检查项：硬编码密码/密钥、SQL注入、XSS漏洞、敏感信息泄露、不安全的依赖使用。
无问题输出：{\"issues\":[]}
有问题输出：{\"issues\":[{\"severity\":\"high/medium/low\",\"type\":\"问题类型\",\"line\":\"相关代码\",\"suggestion\":\"修复建议\"}]}
只输出 JSON。

文件：$FILE_PATH
\`\`\`
$FILE_CONTENT
\`\`\`"

SECURITY_OUT="/tmp/dev-guard-security.json"
SECURITY_STATUS=$(call_ai "$SECURITY_PROMPT" "$SECURITY_OUT" "true")

if [ "$SECURITY_STATUS" = "200" ]; then
  SECURITY_RESULT=$(jq -r '.choices[0].message.content // empty' "$SECURITY_OUT" 2>/dev/null)
  ISSUE_COUNT=$(echo "$SECURITY_RESULT" | jq -r '.issues | length' 2>/dev/null || echo "0")

  if [ "$ISSUE_COUNT" -gt 0 ] 2>/dev/null; then
    BODY=$(echo "$SECURITY_RESULT" | jq -r '
      "## 🔍 AI 安全扫描发现问题\n\n**文件：** `'"$FILE_PATH"'`\n\n---\n\n" +
      (.issues | map(
        "### " + (if .severity=="high" then "🔴" elif .severity=="medium" then "🟡" else "🟢" end) +
        " " + .type + "\n\n**代码：**\n```\n" + .line + "\n```\n\n**建议：** " + .suggestion
      ) | join("\n\n")) +
      "\n\n---\n*由 AI 开发守卫自动生成*"
    ' 2>/dev/null)

    URL=$(create_issue "🛡️ 安全问题: $FILE_NAME 中发现 $ISSUE_COUNT 个问题" "$BODY" '["security","automated"]')
    if [ -n "$URL" ]; then
      echo "[dev-guard] 🔴 安全问题 $ISSUE_COUNT 个 → $URL" >> "$LOG_FILE"
      echo "🛡️ [dev-guard] 安全问题 $ISSUE_COUNT 个 → $URL" >&2
    fi
  else
    echo "[dev-guard] ✅ 安全扫描通过" >> "$LOG_FILE"
  fi
fi
rm -f "$SECURITY_OUT"

# ════════════════════════════════════════════════════════════════════════════
# 2. 代码质量审查（Code Reviewer）
# ════════════════════════════════════════════════════════════════════════════
REVIEW_PROMPT="你是代码质量专家。审查以下代码，只输出 JSON。
检查项：命名规范、函数过长、重复逻辑、性能问题、类型安全、注释缺失。
无问题输出：{\"issues\":[]}
有问题输出：{\"issues\":[{\"severity\":\"high/medium/low\",\"type\":\"问题类型\",\"line\":\"相关代码\",\"suggestion\":\"改进建议\"}]}
只输出 JSON，不超过 3 个问题。

文件：$FILE_PATH
\`\`\`
$FILE_CONTENT
\`\`\`"

REVIEW_OUT="/tmp/dev-guard-review.json"
REVIEW_STATUS=$(call_ai "$REVIEW_PROMPT" "$REVIEW_OUT" "true")

if [ "$REVIEW_STATUS" = "200" ]; then
  REVIEW_RESULT=$(jq -r '.choices[0].message.content // empty' "$REVIEW_OUT" 2>/dev/null)
  REVIEW_COUNT=$(echo "$REVIEW_RESULT" | jq -r '.issues | length' 2>/dev/null || echo "0")

  if [ "$REVIEW_COUNT" -gt 0 ] 2>/dev/null; then
    BODY=$(echo "$REVIEW_RESULT" | jq -r '
      "## 📋 AI 代码质量审查\n\n**文件：** `'"$FILE_PATH"'`\n\n---\n\n" +
      (.issues | map(
        "### " + (if .severity=="high" then "🔴" elif .severity=="medium" then "🟡" else "🟢" end) +
        " " + .type + "\n\n**代码：**\n```\n" + .line + "\n```\n\n**建议：** " + .suggestion
      ) | join("\n\n")) +
      "\n\n---\n*由 AI 开发守卫自动生成*"
    ' 2>/dev/null)

    URL=$(create_issue "📋 代码质量: $FILE_NAME 中发现 $REVIEW_COUNT 个问题" "$BODY" '["code-quality","automated"]')
    if [ -n "$URL" ]; then
      echo "[dev-guard] 🟡 代码质量问题 $REVIEW_COUNT 个 → $URL" >> "$LOG_FILE"
      echo "📋 [dev-guard] 代码质量问题 $REVIEW_COUNT 个 → $URL" >&2
    fi
  else
    echo "[dev-guard] ✅ 代码质量审查通过" >> "$LOG_FILE"
  fi
fi
rm -f "$REVIEW_OUT"

# ════════════════════════════════════════════════════════════════════════════
# 3. 自动生成单元测试（Test Generator）
# 只对非测试文件且无对应测试文件时生成
# ════════════════════════════════════════════════════════════════════════════
case "$FILE_PATH" in
  *.test.*|*.spec.*|*__tests__*) # 已经是测试文件，跳过
    echo "[dev-guard] ⏭ 跳过测试文件" >> "$LOG_FILE"
    ;;
  *)
    # 推断测试文件路径
    DIR=$(dirname "$FILE_PATH")
    BASE="${FILE_NAME%.*}"
    EXT="${FILE_NAME##*.}"
    TEST_FILE="$DIR/__tests__/$BASE.test.$EXT"

    if [ -f "$TEST_FILE" ]; then
      echo "[dev-guard] ⏭ 测试文件已存在: $TEST_FILE" >> "$LOG_FILE"
    else
      TEST_PROMPT="你是测试专家，使用 Jest + TypeScript。为以下代码生成单元测试。
要求：
- 只输出可直接运行的测试代码，不加任何说明
- 覆盖主要函数的正常和边界情况
- import 路径使用 '../$(basename "$FILE_PATH" ".$EXT")'
- 如果是 React 组件使用 @testing-library/react

文件：$FILE_PATH
\`\`\`
$FILE_CONTENT
\`\`\`"

      TEST_OUT="/tmp/dev-guard-test.json"
      TEST_STATUS=$(call_ai "$TEST_PROMPT" "$TEST_OUT" "false")

      if [ "$TEST_STATUS" = "200" ]; then
        TEST_CODE=$(jq -r '.choices[0].message.content // empty' "$TEST_OUT" 2>/dev/null)
        # 去掉 markdown 代码块标记
        TEST_CODE=$(echo "$TEST_CODE" | sed 's/^```[a-z]*//;s/^```//')

        if [ -n "$TEST_CODE" ]; then
          mkdir -p "$DIR/__tests__"
          echo "$TEST_CODE" > "$TEST_FILE"
          echo "[dev-guard] 🧪 测试文件已生成: $TEST_FILE" >> "$LOG_FILE"
          echo "🧪 [dev-guard] 测试文件已生成 → $TEST_FILE" >&2
        fi
      fi
      rm -f "$TEST_OUT"
    fi
    ;;
esac

rm -f /tmp/dev-guard-*.json
