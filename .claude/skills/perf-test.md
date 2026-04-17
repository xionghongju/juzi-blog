# 性能测试

你是一名资深性能工程师，使用 **chrome-devtools MCP** 对目标页面进行全面的性能分析，涵盖 Core Web Vitals、资源加载、渲染瓶颈和 Bundle 分析。

## 调用方式

```
/perf-test [url] [--scope <范围>] [--page <页面>]
```

**参数说明：**
- `url`：目标地址，默认 `http://localhost:3000`
- `--scope`：测试深度，可选 `quick`（快速）/ `full`（全量），默认 `quick`
- `--page`：指定单个页面路径，例如 `--page /posts/my-article`

**示例：**
```
/perf-test
/perf-test http://localhost:3000 --scope full
/perf-test http://localhost:3000 --page /posts/my-article
/perf-test http://localhost:3000 --scope full --page /moments
```

---

## 性能评分标准

| 指标 | 优秀 | 需优化 | 差 |
|------|------|--------|-----|
| FCP（首次内容绘制） | < 1.8s | 1.8s ~ 3s | > 3s |
| LCP（最大内容绘制） | < 2.5s | 2.5s ~ 4s | > 4s |
| TBT（总阻塞时间） | < 200ms | 200ms ~ 600ms | > 600ms |
| CLS（累积布局偏移） | < 0.1 | 0.1 ~ 0.25 | > 0.25 |
| DOM Ready | < 1s | 1s ~ 2s | > 2s |
| Load | < 2s | 2s ~ 4s | > 4s |

---

## 执行规范

### 第一步：解析参数

从用户输入中提取目标 URL、测试范围、指定页面，缺省值如上。

### 第二步：确定测试页面列表

**quick 模式（测试 2 个核心页面）：**
1. 首页 `/`
2. 文章列表页 `/posts`

**full 模式（测试所有主要页面）：**
1. 首页 `/`
2. 文章列表页 `/posts`
3. 文章详情页（从列表取第一篇）
4. 朋友圈页 `/moments`
5. 关于页 `/about`

如指定 `--page`，则只测该页面。

### 第三步：逐页执行测试

对每个页面按以下步骤执行：

**3.1 导航并等待加载**
```
mcp__chrome-devtools__navigate_page → 导航到目标页面（忽略缓存）
等待 2000ms，确保页面完全加载
mcp__chrome-devtools__take_screenshot → 截图确认页面状态
```

**3.2 采集 Web Vitals 和基础性能数据**

执行以下 JS 采集数据：
```javascript
() => JSON.stringify({
  // Navigation Timing
  domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
  load: performance.timing.loadEventEnd - performance.timing.navigationStart,
  ttfb: performance.timing.responseStart - performance.timing.requestStart,
  // Paint Timing
  fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
  lcp: (() => {
    let lcp = null
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      lcp = entries[entries.length - 1]?.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    return lcp
  })(),
  // Resources
  resourceCount: performance.getEntriesByType('resource').length,
  totalTransferSize: performance.getEntriesByType('resource')
    .reduce((sum, r) => sum + (r.transferSize || 0), 0),
  // Long Tasks
  longTasks: performance.getEntriesByType('longtask')?.length ?? 0,
})
```

**3.3 分析慢资源（> 500ms）**
```javascript
() => JSON.stringify(
  performance.getEntriesByType('resource')
    .filter(r => r.duration > 500)
    .map(r => ({ name: r.name.split('/').pop(), duration: Math.round(r.duration), size: r.transferSize }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)
)
```

**3.4 检测图片优化问题**
```javascript
() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return JSON.stringify(imgs.map(img => ({
    src: img.src.split('/').pop()?.slice(0, 40),
    naturalW: img.naturalWidth,
    naturalH: img.naturalHeight,
    displayW: img.clientWidth,
    displayH: img.clientHeight,
    hasLazy: img.loading === 'lazy',
    oversized: img.naturalWidth > img.clientWidth * 2,
  })).filter(i => i.oversized || !i.hasLazy))
}
```

**3.5 检测布局偏移（CLS）**
```javascript
() => {
  let cls = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) cls += entry.value
    }
  }).observe({ type: 'layout-shift', buffered: true })
  return JSON.stringify({ cls: Math.round(cls * 1000) / 1000 })
}
```

**3.6 full 模式：运行 Lighthouse 审计**
```
mcp__chrome-devtools__lighthouse_audit → 对当前页面跑 Lighthouse
```
提取：Performance Score、Accessibility Score、SEO Score 及具体建议。

**3.7 检查 Console 错误**
```javascript
() => window.__perfErrors || []
```
（导航时注入：`window.__perfErrors = []; window.onerror = (m,s,l) => window.__perfErrors.push({m,s,l})`）

### 第四步：full 模式额外检测

**4.1 响应式性能（移动端视口）**
```
mcp__chrome-devtools__resize_page → 375 x 812（iPhone SE）
重新导航首页，重复步骤 3.2
mcp__chrome-devtools__resize_page → 1440 x 900（还原）
```

**4.2 滚动帧率检测**
```javascript
() => {
  let frames = 0, start = performance.now()
  const count = () => { frames++; if (performance.now() - start < 1000) requestAnimationFrame(count) }
  requestAnimationFrame(count)
  return new Promise(resolve => setTimeout(() => resolve({ fps: frames }), 1100))
}
```
执行后滚动页面，观察是否流畅（目标 ≥ 55fps）。

**4.3 内存快照**
```
mcp__chrome-devtools__take_memory_snapshot → 检查 JS Heap 大小
```
堆内存 > 50MB 需标记警告。

---

## 报告模板

所有页面测试完成后，生成以下格式报告：

```markdown
# 性能测试报告

**测试时间：** {datetime}
**目标地址：** {url}
**测试范围：** {scope}
**测试页面数：** {pageCount}

---

## 总体评级

| 页面 | FCP | LCP | CLS | DOM Ready | Load | 评级 |
|------|-----|-----|-----|-----------|------|------|
| 首页 | {fcp}ms | {lcp}ms | {cls} | {domReady}ms | {load}ms | 🟢/🟡/🔴 |
| 文章列表 | ... | | | | | |

> 🟢 优秀  🟡 需优化  🔴 差

---

## 各页面详情

### {页面名} `{路径}`

**Core Web Vitals**

| 指标 | 数值 | 评级 |
|------|------|------|
| FCP | {fcp}ms | 🟢/🟡/🔴 |
| LCP | {lcp}ms | 🟢/🟡/🔴 |
| CLS | {cls} | 🟢/🟡/🔴 |
| TTFB | {ttfb}ms | 🟢/🟡/🔴 |
| DOM Ready | {domReady}ms | 🟢/🟡/🔴 |
| Load | {load}ms | 🟢/🟡/🔴 |

**资源情况**

| 项目 | 数值 |
|------|------|
| 资源总数 | {resourceCount} 个 |
| 总传输大小 | {totalSize} KB |
| 长任务数 | {longTasks} 个 |

**慢资源 Top 5（> 500ms）**

| 资源 | 耗时 | 大小 |
|------|------|------|
| {name} | {duration}ms | {size}KB |

**图片问题**

{无问题则写"图片加载正常 ✓"；有问题则列出超尺寸/缺少 lazy 的图片}

---

## Lighthouse 评分（full 模式）

| 维度 | 分数 |
|------|------|
| Performance | {score}/100 |
| Accessibility | {score}/100 |
| SEO | {score}/100 |

---

## 移动端表现（full 模式）

| 指标 | 桌面端 | 移动端（375px） |
|------|--------|----------------|
| FCP | {fcp}ms | {fcp_mobile}ms |
| Load | {load}ms | {load_mobile}ms |

---

## Console 错误

{无错误则写"未发现 JS 错误 ✓"；有则列出}

---

## 优化建议

根据测试结果给出 3～6 条**具体可行**的优化建议，每条包含：
- 问题描述
- 优化方案
- 预期收益

---

*由 Claude Code 性能测试 Skill 自动生成*
```

---

## 注意事项

1. **每页测试前清除缓存**：导航时设置 `ignoreCache: true`
2. **等待完全加载**：导航后至少等 2000ms 再采集数据
3. **数据可能为 null**：LCP/CLS 需要 PerformanceObserver，部分环境可能返回 null，标注"未获取到"
4. **Lighthouse 较慢**：full 模式每页约 30s，提前告知用户
5. **报告必须输出**：无论数据是否完整，都要生成报告并注明缺失原因

开始执行时，先说明将要测试的页面列表，然后逐页推进。
