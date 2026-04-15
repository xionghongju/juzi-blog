# UI 自动化探索测试

你是一名资深 QA 工程师，使用 **chrome-devtools MCP** 工具结合 **AI Vision** 对目标 Web 应用进行自主探索测试。

## 调用方式

```
/ui-test [url] [--scope <范围>] [--flow <流程>]
```

**参数说明：**
- `url`：目标地址，默认 `http://localhost:3000`
- `--scope`：测试范围，可选 `smoke`（冒烟）/ `full`（全量）/ `admin`（后台），默认 `smoke`
- `--flow`：指定单个流程，例如 `--flow 登录`

**示例：**
```
/ui-test
/ui-test http://localhost:3000 --scope full
/ui-test http://localhost:3000/login --flow 登录
/ui-test http://localhost:3000 --scope admin
```

---

## 执行规范

### 第一步：解析参数

从用户输入中提取：
- 目标 URL（无则默认 `http://localhost:3000`）
- 测试范围（无则默认 `smoke`）
- 指定流程（无则按范围执行全部）

### 第二步：根据范围确定测试计划

**smoke（冒烟测试）— 快速验证核心可用性：**
1. 首页加载
2. 导航链接跳转
3. 文章列表页
4. 朋友圈页面
5. 关于页面

**full（全量测试）— 覆盖所有前台功能：**
1. smoke 全部流程
2. 文章详情页（有文章时）
3. 评论提交
4. 朋友圈点赞
5. 主题切换（暗色/亮色）
6. 搜索功能
7. 分类筛选
8. 响应式（缩小视口到 375px 再放回）

**admin（后台测试）：**
1. 登录页表单验证（空表单提交）
2. 错误账号登录
3. 正确账号登录（如提供账号）
4. Dashboard 数据概览
5. 文章列表页加载
6. 写文章页编辑器
7. 动态管理页
8. 评论管理页
9. 素材库页
10. 网站设置页

### 第三步：逐项执行测试

对每个测试项，按以下步骤执行：

```
1. 使用 mcp__chrome-devtools__navigate 导航到目标页面
2. 使用 mcp__chrome-devtools__screenshot 截图
3. 用 Vision 分析截图，判断页面状态
4. 根据测试项执行对应操作（点击、输入、滚动）
5. 再次截图，判断操作结果
6. 记录：✅ 通过 / ❌ 失败 / ⚠️ 异常
```

### 第四步：异常处理规范

遇到以下情况立即记录为失败并继续下一项，不中断整体测试：
- 页面白屏（body 为空或只有 loading）
- Console 有红色错误（使用 `mcp__chrome-devtools__evaluate` 检查）
- 操作后页面无响应超过 3 秒
- 视觉上出现明显错位、文字溢出、图片破损
- 预期跳转未发生

### 第五步：Console 错误检测

每个页面导航后，运行：
```javascript
// 检查 console 错误
window.__errors = [];
window.onerror = (msg, src, line) => window.__errors.push({msg, src, line});
```

页面操作完成后检查：
```javascript
window.__errors
```

### 第六步：性能快照（full 模式）

在首页运行：
```javascript
JSON.stringify({
  fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
  domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
  load: performance.timing.loadEventEnd - performance.timing.navigationStart,
})
```

### 第七步：生成测试报告（✅ 必须执行）

在所有测试完成后，立即执行本步骤：

1. **收集测试数据**
   - 统计通过/失败/异常用例数
   - 计算通过率（百分比）
   - 汇总所有 Screenshot 描述
   - 收集 Console 错误日志
   - 记录性能数据（如可用）

2. **生成 Markdown 报告**
   - 使用下方"报告模板"格式
   - 填充实际测试数据和分析
   - 按分类列出通过/失败/异常用例
   - 添加具体的创新建议（至少 3 条）

3. **输出报告**
   - 选项 A：保存为 `test-report-YYYY-MM-DD-HHmmss.md` 到 `test-reports/` 文件夹（📌 推荐）
   - 选项 B：在对话中直接输出完整报告
   - 选项 C：同时做 A 和 B
   - ⭐ **重要**：`test-reports/` 文件夹已在 `.gitignore` 中配置，保存的报告不会提交到 Git

4. **报告质量检查清单**
   - [ ] 包含测试时间、环境、工具说明
   - [ ] 有通过率和统计数据表格
   - [ ] 详细列出每个用例的结果
   - [ ] 异常用例有明确的描述和影响分析
   - [ ] Console 错误有汇总（或"无错误 ✓"）
   - [ ] 性能数据已记录（可用时）
   - [ ] 有具体的、可行动的改进建议
   - [ ] 报告格式清晰，易于阅读

---

## 报告模板

所有测试完成后，生成以下格式的 Markdown 报告，输出给用户：

```markdown
# UI 测试报告

**测试时间：** {datetime}
**目标地址：** {url}
**测试范围：** {scope}
**执行耗时：** {duration}

---

## 总览

| 指标 | 数值 |
|------|------|
| 总用例数 | {total} |
| ✅ 通过 | {passed} |
| ❌ 失败 | {failed} |
| ⚠️ 异常 | {warning} |
| 通过率 | {rate}% |

---

## 详细结果

### ✅ 通过的用例

| 用例 | 说明 |
|------|------|
| {name} | {desc} |

### ❌ 失败的用例

| 用例 | 失败原因 | 截图描述 |
|------|---------|---------|
| {name} | {reason} | {screenshot_desc} |

### ⚠️ 异常 / 需关注

| 用例 | 异常描述 |
|------|---------|
| {name} | {desc} |

---

## Console 错误汇总

{如无错误，写"未发现 JS 错误 ✓"；有错误则列出}

---

## 性能数据（full 模式）

| 指标 | 数值 |
|------|------|
| FCP | {fcp}ms |
| DOM Ready | {domReady}ms |
| Load | {load}ms |

---

## 建议

{根据测试结果，给出 1-5 条具体可行的改进建议}

---

*由 Claude Code UI 探索测试 Skill 自动生成*
```

---

## 测试执行细则

### 导航操作
```
mcp__chrome-devtools__navigate  →  打开页面
mcp__chrome-devtools__screenshot  →  截图（每步必截）
```

### 交互操作
```
mcp__chrome-devtools__click       →  点击元素（用 CSS selector 或坐标）
mcp__chrome-devtools__type        →  输入文字
mcp__chrome-devtools__evaluate    →  执行 JS，获取页面数据
mcp__chrome-devtools__scroll      →  滚动页面
```

### Vision 分析要点
截图后重点观察：
- 页面是否正常渲染（非白屏、非 loading 卡住）
- 导航栏是否完整显示
- 主要内容区域是否有内容
- 是否有明显的视觉错误（错位、溢出、图片破损）
- 交互反馈是否符合预期（按钮点击后状态变化、页面跳转等）

### 等待策略
- 导航后等待 1500ms 再截图（页面渲染需要时间）
- 点击后等待 800ms 再截图
- 表单提交后等待 2000ms 再截图

---

## 注意事项

1. **无需安装任何依赖**，直接使用 chrome-devtools MCP 工具
2. **每步必截图**，Vision 是判断成功失败的唯一依据
3. **不因单项失败中断**，记录后继续下一项
4. **测试数据不污染**：评论、动态等提交测试数据时，内容前加 `[TEST]` 标记
5. **admin 测试**：如未提供账号密码，跳过需要登录的用例，只测试登录页本身
6. **📁 报告存放位置** — 所有测试报告应保存到 `test-reports/` 文件夹
   - 该文件夹已配置 `.gitignore`，报告文件不会被 Git 跟踪
   - 文件命名格式：`test-report-YYYY-MM-DD-HHmmss.md`
   - 这样保持版本控制干净，避免本地测试污染共享仓库
7. **⭐ 报告必须输出** - 以下为强制要求：
   - ✅ 无论测试通过失败，**必须**生成完整的 Markdown 测试报告
   - ✅ 报告需包含：总体数据统计、详细用例结果、异常分析、Screenshot 描述、Console 错误、性能数据（可用时）、改进建议
   - ✅ 报告保存到 `test-reports/` 文件夹，同时也可输出给用户
   - ✅ 报告风格参考下方"报告模板"，使用 Markdown 表格和清晰的结构
   - ✅ 建议在报告中加入通过率、关键问题等摘要，便于快速了解测试结果

---

开始执行时，先确认 chrome-devtools MCP 已连接，然后按计划逐项推进。

---

## 与其他 Skill 的衔接

### 集成 `debug-and-fix` Skill

当测试发现问题时，可seamless切换到调试 Skill：

**流程：**
1. 测试完成，生成报告
2. 若发现 2+ 个失败项或关键异常，向用户提示：
   ```
   🐛 发现 {count} 个失败项：
   - {问题 1}
   - {问题 2}
   
   是否需要我立即用 `debug-and-fix` Skill 排查根因并修复？
   ```

3. 用户确认后（同一对话窗口）：
   - 保持浏览器 session 活跃（无需关闭）
   - 读取 `agents/skills/debug-and-fix/SKILL.md`
   - 直接进入 debug 模式，对发现的问题逐项排查
   - 生成修复建议或代码 PR

**优势：**
- ✅ 测试 → 调试 → 修复，一条龙服务
- ✅ 减少上下文切换，提升效率
- ✅ 浏览器状态保留，便于复现问题
- ✅ 同一对话中完整记录整个过程

**示例对话流：**
```
用户：/ui-test http://localhost:3000 --scope full
↓
[执行全量测试...]
↓
Claude：生成报告，发现 2 个失败项
↓
Claude：是否进入 debug 模式修复这些问题？
↓
用户：是的，继续排查
↓
Claude：读取 debug-and-fix SKILL，进入调试流程
↓
[修复问题、生成 PR...]
↓
完成！
```

