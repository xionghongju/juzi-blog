---
name: debug-and-fix
description: "网站问题调试与修复。接收 UI 测试失败项或用户报告的问题，进行根因分析、代码定位、生成修复方案或代码 PR。支持前台、后台、数据库等多层面调试。"
---

# 🐛 网站问题调试与修复

一套完整的调试框架，用于快速定位和修复网站中发现的问题。通常作为 `ui-test` Skill 的下游，接收测试报告中的失败项进行深入调试。

## 调用方式

```
/debug-and-fix [问题描述] [--module <模块>] [--type <类型>] [--priority <优先级>]
```

**参数说明：**
- `问题描述`：具体的问题或错误信息
- `--module`：涉及的模块，可选 `frontend`（前台）/ `backend`（后台）/ `database`（数据库）/ `auth`（鉴权）/ `api`（接口）
- `--type`：问题类型，可选 `bug`（缺陷）/ `perf`（性能）/ `ux`（用户体验）/ `security`（安全）
- `--priority`：优先级，可选 `critical`（严重）/ `high`（高）/ `medium`（中）/ `low`（低）

**示例：**
```
/debug-and-fix 登录失败无错误提示 --module frontend --type ux --priority high
/debug-and-fix 搜索功能大小写敏感 --module frontend --type bug --priority medium
/debug-and-fix 评论提交后页面卡顿 --module api --type perf --priority high
```

---

## 执行规范

### 第一步：问题诊断

从问题描述中提取关键信息：
- **问题现象**：用户看到什么（白屏、错误提示、功能不工作等）
- **触发条件**：怎样才能复现（点击某按钮、输入特定数据等）
- **预期行为**：应该怎样（显示成功消息、跳转到某页面等）
- **影响范围**：涉及哪些功能/页面

例如问题："登录失败无错误提示"
```
现象：用户输入错误的邮箱密码后点击登录，没有任何错误提示
触发条件：在 /login 页面，输入 wrong@example.com / wrongpassword，点击登录
预期行为：显示红色错误提示 "邮箱或密码错误"
影响范围：后台管理登录流程（所有需要登录的页面都受影响）
```

### 第二步：快速定位代码

根据问题涉及的模块，快速定位相关代码：

**前台问题（frontend）：**
```bash
# 定位组件
src/components/blog/     # 前台页面组件
src/components/admin/    # 后台管理组件
src/hooks/               # 自定义 Hook
src/stores/              # Zustand 状态管理
```

**后台问题（backend / API）：**
```bash
src/services/            # 数据请求层
src/lib/supabase.ts      # Supabase 客户端
src/app/(admin)/         # 后台管理页面
```

**类型检查：**
```bash
src/types/               # TypeScript 类型
src/lib/utils.ts         # 工具函数
src/lib/constants.ts     # 全局常量
```

### 第三步：根因分析

针对不同类型的问题，进行专项分析：

**🐛 缺陷类（Bug）**
```
运行 semantic_search 搜索相关代码
→ 读取相关文件
→ 检查逻辑是否正确
→ 检查错误处理是否完善
→ 检查数据流是否正常
```

**⚡ 性能类（Performance）**
```
分析瓶颈：
- API 响应时间？
- 组件渲染次数过多？
- 数据库查询效率？
- 资源加载慢？
→ 使用性能分析工具定位
→ 提出优化方案
```

**😊 用户体验类（UX）**
```
站在用户角度检查：
- 信息反馈是否及时？
- 错误提示是否明确？
- 操作流程是否顺畅？
- 视觉设计是否一致？
```

**🔒 安全类（Security）**
```
检查：
- 输入验证是否充分？
- 敏感信息是否加密存储？
- API 鉴权是否正确？
- SQL 注入风险？
```

### 第四步：修复方案设计

根据根因，设计修复方案。分三档方案：

**方案 A（轻量级）** — 可立即修复
- 只需改几行代码
- 不影响其他功能
- 回归风险低

**方案 B（中量级）** — 需要一定重构
- 改动涉及多个文件
- 可能需要修改数据库 schema
- 需要完整回归测试

**方案 C（重量级）** — 需要架构调整
- 需要重新设计某个模块
- 影响系统整体
- 优先级较低，可拆分任务

### 第五步：代码实现与验证

**实现步骤：**
1. 创建新分支：`git checkout -b fix/issue-name`
2. 实现修复代码
3. 验证修复（本地测试或浏览器验证）
4. 确保无 ESLint 错误和 TypeScript 报错
5. 运行完整测试确认无回归

**验证方式：**
```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit

# 完整测试
/ui-test http://localhost:3000 --scope full
```

### 第六步：生成修复报告与 PR

修复完成后，生成结构化的修复报告：

```markdown
# 修复报告：[问题标题]

**问题描述**
[简介]

**根因分析**
[为什么出现这个问题]

**解决方案**
[如何修复，涉及哪些文件]

**改动文件**
- src/components/admin/LoginForm.tsx
- src/services/auth.service.ts

**验证方法**
[如何验证修复是否有效]

**回归风险评估**
[是否可能影响其他功能]
```

同时生成 Git diff 或 PR 概览。

---

## 问题类型与调试策略

### 🖥️ 前台问题（Frontend）

**常见问题类型：**
1. 页面白屏/加载失败
2. 按钮/链接不工作
3. 表单验证不生效
4. 数据不显示/显示错误
5. 样式错位/溢出
6. 交互反馈缺失

**调试步骤：**
```
1. 打开浏览器 DevTools (F12)
2. 检查 Console 是否有红色错误
3. 检查 Network tab 请求是否正常
4. 检查 Elements 看 DOM 结构是否正确
5. 使用 React DevTools 检查组件状态
6. 逐行追踪代码逻辑
```

**相关文件：**
- `src/components/blog/` — 前台页面组件
- `src/components/admin/` — 后台管理组件
- `src/hooks/` — 自定义 Hook（状态逻辑）
- `src/stores/` — Zustand 全局状态

### 🔐 后台问题（Backend / Auth）

**常见问题类型：**
1. 登录失败
2. 权限检查不工作
3. 数据保存失败
4. 接口返回错误

**调试步骤：**
```
1. 检查 Supabase 鉴权是否正确
2. 验证 API 请求参数是否正确
3. 检查数据库连接和权限
4. 查看 Supabase 日志
5. 验证 Token 是否过期
```

**相关文件：**
- `src/lib/supabase.ts` — Supabase 客户端配置
- `src/services/` — API 请求封装
- `src/stores/useAuthStore.ts` — 认证状态
- `src/components/admin/AdminAuthGuard.tsx` — 权限检查

### 🗄️ 数据库问题（Database）

**常见问题类型：**
1. 查询结果为空
2. 数据更新失败
3. 关联查询数据不一致
4. 数据类型不匹配

**调试步骤：**
```
1. 登录 Supabase Dashboard
2. 检查表结构和数据
3. 运行 SQL 查询验证数据
4. 检查 RLS（行级安全）策略
5. 验证关联关系（FK）是否正确
```

---

## 调试工具与快捷方式

### 浏览器 DevTools

```javascript
// 快速查看 React 组件树
// 右键 → Inspect Element → 切到 React DevTools tab

// 在控制台查看全局状态（Zustand）
import { useAuthStore } from '@/stores/useAuthStore'
console.log(useAuthStore.getState())

// 监听状态变化
useAuthStore.subscribe(state => console.log('State changed:', state))
```

### Supabase 调试

```javascript
// 在浏览器控制台直接调用 Supabase
import { supabase } from '@/lib/supabase'

// 查询示例
const { data } = await supabase.from('posts').select('*')
console.log(data)

// 检查认证状态
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

### 常用 CLI 命令

```bash
# 检查代码质量
npm run lint

# TypeScript 类型检查
npx tsc --noEmit

# 搜索代码
grep -r "searchTerm" src/

# 查看文件结构
tree src/ -L 3
```

---

## 常见修复案例

### 案例 1：登录失败无错误提示

**问题：** 登录失败时用户看不到错误信息

**根因：** 后端返回 400 错误，但前端未在 UI 中显示错误消息

**修复方案：**
```jsx
// src/components/admin/LoginForm.tsx
const [error, setError] = useState<string | null>(null)

const handleLogin = async () => {
  setError(null)
  try {
    // ... 登录逻辑
  } catch (err) {
    setError(err.message) // ← 捕获错误
    toast.error(err.message) // ← 显示 Toast
  }
}

// 在表单上方显示错误
{error && <div className="text-red-500 mb-4">{error}</div>}
```

**改动文件：**
- `src/components/admin/LoginForm.tsx`

**验证：** 重新测试 `/ui-test http://localhost:3000/login --flow 登录`

---

### 案例 2：搜索功能大小写敏感

**问题：** 搜索 "Next" 没结果，但 "next" 有结果

**根因：** 数据库查询或前端过滤使用了区分大小写的比较

**修复方案（数据库层）：**
```sql
-- 修改查询为不区分大小写
SELECT * FROM posts 
WHERE LOWER(title) LIKE LOWER('%Next%')
```

**修复方案（前端层）：**
```typescript
// src/services/post.service.ts
const filteredPosts = posts.filter(p =>
  p.title.toLowerCase().includes(query.toLowerCase())
)
```

**改动文件：**
- `src/services/post.service.ts`

**验证：** 搜索 "Next"、"next"、"NEXT" 都能返回结果

---

### 案例 3：朋友圈没有演示数据

**问题：** 朋友圈无法测试点赞功能

**修复方案：** 在开发库中插入演示数据

```sql
-- 在 Supabase SQL editor 中运行
INSERT INTO moments (content, image_urls, location, mood, created_at) VALUES
('测试动态 1 - 美食', '["https://example.com/1.jpg"]', '北京', '😋', NOW()),
('测试动态 2 - 旅游', '["https://example.com/2.jpg"]', '杭州', '🎉', NOW()),
('测试动态 3 - 技术', NULL, '居家', '💻', NOW());
```

**改动文件：** 无代码改动，仅数据库初始化脚本

**验证：** `/ui-test /moments --flow 朋友圈点赞`

---

## 注意事项

1. **保持向后兼容** — 修复不应破坏现有功能
2. **完整测试** — 修复后必须运行完整的 ui-test 确认无回归
3. **代码风格** — 遵循项目的代码规范（ESLint、Prettier）
4. **提交信息** — Git 提交使用规范前缀：`fix: 登录失败无错误提示`
5. **跨浏览器** — 如涉及样式问题，检查多个浏览器兼容性
6. **沟通** — 修复前可与用户确认解决方案是否合适

---

## 与 ui-test Skill 的衔接

### 从 ui-test 接收问题

ui-test 完成后，若发现失败项会主动提示：

```
🐛 发现 2 个失败项：
1. 登录失败无错误提示 | 模块: frontend | 优先级: high
2. 搜索大小写敏感 | 模块: frontend | 优先级: medium

是否继续用 debug-and-fix 排查修复？
```

### 无缝衔接

```
用户确认 → debug-and-fix 启动
↓
逐项根因分析 → 生成修复代码
↓
独立核验（本地测试）
↓
生成修复报告 + Git diff
↓
建议下一步：代码审查 / 合并 / 重新测试
```

**保持的上下文：**
- 浏览器 session 仍保持活跃
- 之前的测试数据和环境不变
- 可直接在浏览器中验证修复

---

## 工作流检查清单

调试和修复完成后，检查：

- [ ] 问题根因已明确说明
- [ ] 修复代码已实现
- [ ] 相关文件已列出
- [ ] ESLint / TypeScript 检查通过（无报错）
- [ ] 本地测试已验证修复有效
- [ ] 确认无明显回归风险
- [ ] Git 提交信息规范（`fix: xxx`）
- [ ] 修复报告已生成

---

**由 Claude Code Debug & Fix Skill 提供** ✨

*用于快速定位和修复网站问题，与 ui-test Skill 无缝衔接*
