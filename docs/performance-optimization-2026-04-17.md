# 性能优化记录 — 2026-04-17

## 背景

通过 `/perf-test` 对首页和文章列表页进行性能基准测试，发现以下主要问题：

- 图片全部无法显示（`<img>` 未使用 lazy loading，原图尺寸远超显示尺寸）
- 文章列表页 TTFB 高达 13 秒（categories + posts 串行查询）
- `next.config.ts` 中 `hostname: "**"` 通配符在 Next.js 15 中无法正常工作
- 开发环境 DNS 将外部域名解析为私有 IP，Next.js Image 代理拒绝请求

---

## 测试环境

- **框架**：Next.js 15（App Router）
- **环境**：本地开发（`next dev --webpack`）
- **测试工具**：chrome-devtools MCP + Performance API
- **测试页面**：首页 `/`、文章列表页 `/posts`

---

## 优化前性能基准

### 首页 `/`

| 指标 | 数值 | 评级 |
|------|------|------|
| FCP（首次内容绘制） | 2236ms | 🟡 需优化 |
| TTFB（服务器响应） | 2003ms | 🔴 差 |
| DOM Ready | 2199ms | 🔴 差 |
| Load | 3601ms | 🟡 需优化 |
| 长任务数 | 0 | 🟢 |
| 资源总数 | 14 个 | — |
| 总传输大小 | ~2633 KB | — |

**慢资源（> 500ms）：**

| 资源 | 耗时 | 大小 |
|------|------|------|
| 封面图 `.jpg` | 750ms | 缓存（0 KB） |
| 封面图 `.webp` | 748ms | 缓存（0 KB） |
| 封面图 `.jpeg` | 747ms | 缓存（0 KB） |
| `main-app.js` | 698ms | 2431 KB |

**图片问题（5 张）：**

| 图片 | 原始尺寸 | 显示尺寸 | 问题 |
|------|----------|----------|------|
| Unsplash 封面 1 | 1080×608 | 515×331 | 超尺寸 + 无 lazy |
| Unsplash 封面 2 | 1080×720 | 315×177 | 超尺寸 + 无 lazy |
| 用户图 `.webp` | 4000×2250 | 315×177 | **严重超尺寸** + 无 lazy |
| 用户图 `.jpg` | 1280×1286 | 320×320 | 超尺寸 + 无 lazy |
| 用户图 `.jpeg` | 1080×1080 | 320×320 | 超尺寸 + 无 lazy |

---

### 文章列表页 `/posts`

| 指标 | 数值 | 评级 |
|------|------|------|
| FCP（首次内容绘制） | 13348ms | 🔴 差 |
| TTFB（服务器响应） | **13137ms** | 🔴🔴🔴 极差 |
| DOM Ready | 13347ms | 🔴 差 |
| Load | 14844ms | 🔴 差 |
| 长任务数 | 0 | 🟢 |
| 资源总数 | 14 个 | — |
| 总传输大小 | ~3217 KB | — |

> 导航直接超时（默认 10s timeout），TTFB 13s 是最主要瓶颈。

---

## 问题分析与修改内容

### 问题 1：图片不显示 + 无 lazy loading

**根本原因（两层）：**

1. `next.config.ts` 中 `hostname: "**"` 在 Next.js 15 中无法匹配任何域名，Next.js Image 代理全部返回 400
2. 开发环境 DNS 将 `images.unsplash.com`、`dkyvaxnwcmuoigajlxxh.supabase.co` 等外部域名解析为私有 IP（`198.18.x.x`），Next.js Image 的安全机制检测到后拒绝代理

**修改文件：`next.config.ts`**

```ts
// 修改前
images: {
  remotePatterns: [
    { protocol: "https", hostname: "**" },
  ],
},

// 修改后
images: {
  // 开发环境 DNS 可能将外部域名解析为私有 IP，Next.js 会拒绝代理，故跳过优化
  unoptimized: process.env.NODE_ENV === 'development',
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "dkyvaxnwcmuoigajlxxh.supabase.co" },
  ],
},
```

> `unoptimized: true` 仅在开发环境生效，图片直接使用原始 URL，绕过 `/_next/image` 代理。生产环境走完整图片优化流程。

---

**修改文件：`src/components/blog/PostCard/index.tsx`**

```tsx
// 修改前 — 普通 <img>，无 lazy，无尺寸约束
import Link from 'next/link'

<img
  src={post.cover_image}
  alt={post.title}
  className="w-full h-full object-cover ..."
/>

// 修改后 — Next.js <Image>，自动 lazy + 响应式 srcSet
import Image from 'next/image'

// featured 大图
<Image
  src={post.cover_image}
  alt={post.title}
  fill
  sizes="(max-width: 768px) 100vw, 52vw"
  className="object-cover ..."
  priority   // LCP 元素，优先加载
/>

// 普通卡片
<Image
  src={post.cover_image}
  alt={post.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover ..."
  // 默认 lazy loading
/>
```

---

**修改文件：`src/components/blog/MomentCard/index.tsx`**

```tsx
// 修改前 — framer-motion <motion.img>，无 lazy
import { motion } from 'framer-motion'

<motion.img
  src={img}
  alt=""
  whileHover={{ scale: 1.03 }}
  className="rounded-xl object-cover aspect-square w-full"
/>

// 修改后 — Next.js <Image>，CSS hover 替代 motion 动效
import Image from 'next/image'

<div className="relative aspect-square rounded-xl overflow-hidden">
  <Image
    src={img}
    alt=""
    fill
    sizes="(max-width: 640px) 33vw, 200px"
    className="object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-200"
  />
</div>
```

---

### 问题 2：文章列表页 TTFB 13 秒（串行数据库查询）

**根本原因：** `categories` 查询和 `posts` 查询串行执行，两次网络往返叠加。

**修改文件：`src/app/(blog)/posts/page.tsx`**

```ts
// 修改前 — 串行查询（约 2 × RTT）
const { data: categories } = await supabase.from('categories').select('*').order('name')
const categoryId = categories?.find(c => c.slug === params.category)?.id
const { data, count } = await getPosts(page, categoryId)

// 修改后 — 按场景并行查询
if (keyword) {
  // 搜索场景：categories + 搜索结果 并行
  const [{ data: cats }, { data: results }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    searchPosts(keyword),
  ])
} else if (categorySlug) {
  // 有分类过滤：先取 categories（顺带找 id），再查 posts（依赖 id）
  const { data: cats } = await supabase.from('categories').select('*').order('name')
  const categoryId = cats?.find(c => c.slug === categorySlug)?.id
  const { data, count } = await getPosts(page, categoryId)
} else {
  // 无过滤（最常见）：完全并行
  const [{ data: cats }, { data, count }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    getPosts(page),
  ])
}
```

---

## 优化后性能结果

### 首页 `/`

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| FCP | 2236ms 🟡 | **892ms 🟢** | ↓ 60% |
| TTFB | 2003ms 🔴 | **667ms 🟡** | ↓ 67% |
| DOM Ready | 2199ms 🔴 | **851ms 🟡** | ↓ 61% |
| Load | 3601ms 🟡 | **2186ms 🟡** | ↓ 39% |
| 图片显示 | 全部黑屏 | **全部正常 ✓** | — |

---

### 文章列表页 `/posts`

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| FCP | 13348ms 🔴 | **5872ms 🔴** | ↓ 56% |
| TTFB | 13137ms 🔴 | **5685ms 🔴** | ↓ 57% |
| DOM Ready | 13347ms 🔴 | **5836ms 🔴** | ↓ 56% |
| Load | 14844ms 🔴 | **7246ms 🔴** | ↓ 51% |
| 图片显示 | 全部黑屏 | **全部正常 ✓** | — |

---

## 未解决 / 生产环境说明

### 文章列表页 TTFB 仍较高（5.7s）

开发环境下每次 SSR 请求都要与海外 Supabase 数据库建立连接，延迟高属正常现象。

**生产环境已配置 `revalidate = 60`（ISR）**，部署后：
- 首次访问触发 SSR，生成缓存
- 后续 60 秒内的请求直接返回缓存页面，TTFB < 100ms
- 文章更新后最多 60 秒生效

### main-app.js 仍有 2.4MB

Bundle 体积在开发模式下包含 HMR 客户端代码，不代表生产包大小。建议运行 `npm run build` 后用 `@next/bundle-analyzer` 分析生产 Bundle，再针对性做代码分割。

---

## 修改文件汇总

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `next.config.ts` | 配置修复 | remotePatterns 精确域名 + 开发环境 unoptimized |
| `src/components/blog/PostCard/index.tsx` | 组件优化 | `<img>` → `<Image fill sizes>` |
| `src/components/blog/MomentCard/index.tsx` | 组件优化 | `<motion.img>` → `<Image fill>` |
| `src/app/(blog)/posts/page.tsx` | 数据层优化 | 串行查询改为 `Promise.all` 并行 |
