# 🤖 代理和 Skill 入口

此文件定义项目中的自定义代理（Agents）和技能（Skills）。

---

## 📋 可用 Skills

### 1️⃣ UI 自动化测试 (`ui-test`)

**路径：** `agents/skills/ui-test/SKILL.md`

**用途：** 对网站前台和后台进行自动化 UI 测试，包括冒烟测试、全量测试、登录流程测试等。

**调用方式：**
```
/ui-test [url] [--scope <smoke|full|admin>] [--flow <流程名>]
```

**示例：**
```bash
/ui-test                                        # 默认 smoke 冒烟测试
/ui-test http://localhost:3000 --scope full    # 全量测试
/ui-test http://localhost:3000/login --flow 登录  # 登录流程测试
```

**测试范围：**
- **smoke（冒烟）** — 快速验证：首页、导航、列表页
- **full（全量）** — 完整验证：所有前台功能 + 交互 + 响应式
- **admin（后台）** — 管理后台：登录、权限、CRUD 操作

**输出：** 生成结构化测试报告，保存到 `test-reports/` 文件夹

**特色：**
- ✅ 使用 Chrome DevTools MCP + AI Vision
- ✅ 自动生成 Markdown 测试报告
- ✅ 无缝衔接 `debug-and-fix` Skill 进行问题修复
- ✅ 本地测试报告自动 Git 忽略

---

### 2️⃣ 问题调试与修复 (`debug-and-fix`)

**路径：** `agents/skills/debug-and-fix/SKILL.md`

**用途：** 快速定位和修复网站中发现的问题，包括 Bug、性能、UX、安全等多个维度。

**调用方式：**
```
/debug-and-fix [问题描述] [--module <模块>] [--type <类型>] [--priority <优先级>]
```

**示例：**
```bash
/debug-and-fix 登录失败无错误提示 --module frontend --type ux --priority high
/debug-and-fix 搜索功能大小写敏感 --module frontend --type bug --priority medium
/debug-and-fix 评论提交卡顿 --module api --type perf --priority high
```

**支持的模块：**
- `frontend` — 前台页面、组件、交互
- `backend` / `api` — 后台接口、数据请求
- `auth` — 认证、权限、登录
- `database` — 数据库、查询、Schema

**支持的问题类型：**
- `bug` — 功能缺陷
- `perf` — 性能问题
- `ux` — 用户体验
- `security` — 安全问题

**优先级：**
- `critical` — 严重，需立即修复
- `high` — 高，本周完成
- `medium` — 中，计划内
- `low` — 低，可延后

**输出：** 根因分析 + 修复代码 + 验证方案 + Git diff

**特色：**
- ✅ 6 步完整调试流程
- ✅ 项目专用的代码定位
- ✅ 与 `ui-test` 无缝衔接
- ✅ 本地验证 + 修复报告
- ✅ 完整的案例参考

---

## 🔄 Skill 工作流

### 完整测试 + 修复流程

```
1. 运行 /ui-test 进行自动化测试
   ↓
2. ui-test 生成测试报告
   - 标记通过/失败/异常用例
   - 记录问题详情
   ↓
3. 若发现问题，自动提示：
   "发现 N 个失败项，是否用 /debug-and-fix 继续修复？"
   ↓
4. 用户确认后，进入 /debug-and-fix 流程
   - 逐项根因分析
   - 生成修复代码
   - 本地验证
   ↓
5. 生成修复报告 + Git diff
   ↓
6. 完成！可直接提交 PR 或合并代码
```

### 快速修复单个问题

```
/debug-and-fix [问题描述] [参数]
   ↓
根因分析 → 代码定位 → 修复方案 → 实现 → 验证
   ↓
修复报告 + Git diff
```

---

## 📁 文件结构

```
juzi-blog/
├── AGENTS.md                                ← 🔴 你在这里
├── agents/
│   └── skills/
│       ├── ui-test/
│       │   └── SKILL.md                    ← UI 测试 Skill
│       └── debug-and-fix/
│           └── SKILL.md                    ← 调试修复 Skill
├── test-reports/                            ← 📊 测试报告文件夹（Git 忽略）
│   ├── .gitignore
│   └── README.md
├── .gitignore                               ← ✅ 已包含 test-reports/
└── ... （其他项目文件）
```

---

## ⚙️ 配置说明

### 测试报告管理

- **位置：** `test-reports/` 文件夹
- **格式：** `test-report-YYYY-MM-DD-HHmmss.md`
- **Git 配置：** 已在 `.gitignore` 中忽略，不会污染仓库
- **用途：** 本地开发测试用，不需要版本控制

### Skill 识别

Claude Code 通过以下方式识别 Skill：

1. **目录结构**
   - ✅ `agents/skills/[skill-name]/SKILL.md`
   - ✅ `.agents/skills/[skill-name]/SKILL.md`
   - ✅ `.github/skills/[skill-name]/SKILL.md`

2. **YAML Frontmatter**
   ```yaml
   ---
   name: skill-name
   description: "清晰的描述..."
   ---
   ```

3. **此文件**（AGENTS.md）
   - 提供入口点和使用说明
   - 便于团队成员快速查找

---

## 🚀 快速开始

### 第一次使用

1. **重新加载 VS Code**
   - `Cmd + Shift + P` → `Developer: Reload Window`

2. **运行冒烟测试**
   ```
   /ui-test
   ```
   等待 2-3 分钟，自动生成测试报告

3. **查看报告**
   - 报告地址：`test-reports/test-report-*.md`
   - 或直接在对话窗口查看

4. **若发现问题，修复问题**
   ```
   /debug-and-fix [问题描述] --priority high
   ```

### 常用命令

```bash
# 完整测试（推荐首选）
/ui-test http://localhost:3000 --scope full

# 特定流程测试（登录页）
/ui-test http://localhost:3000/login --flow 登录

# 后台测试（需要有效账号）
/ui-test http://localhost:3000 --scope admin

# 修复单个问题
/debug-and-fix 问题描述 --module frontend --type bug --priority high
```

---

## 📚 相关文档

- [UI 测试 Skill 详细说明](agents/skills/ui-test/SKILL.md)
- [调试修复 Skill 详细说明](agents/skills/debug-and-fix/SKILL.md)
- [测试报告文件夹](test-reports/README.md)
- [项目架构说明](CLAUDE.md)

---

## 🎓 最佳实践

### 定期测试

- **开发中** — 每完成一个功能，运行 `/ui-test --scope full`
- **提交前** — 确保所有测试通过
- **发版前** — 运行完整的 smoke + full 测试

### 问题处理

1. **发现问题** → `/ui-test` 生成报告
2. **分析问题** → `/debug-and-fix` 根因分析
3. **修复代码** → 实现修复方案
4. **验证修复** → 再次运行 `/ui-test` 确认
5. **提交代码** → `git commit` 带清晰的提交信息

### 团队协作

- 测试报告本地生成，不提交到 Git
- 发现的问题记录在 Issue 或项目管理工具
- 修复后通过 PR 进行代码审查

---

**最后更新：** 2026年4月14日  
**维护者：** Claude Code  
**许可证：** MIT
