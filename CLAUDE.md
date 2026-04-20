# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
```

环境变量需配置 `.env.local`（参考 `src/lib/env.ts`）：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（Server Action 直接操作 DB，绕过 RLS）
- `RESEND_API_KEY`（邮件订阅，Resend 服务）
- `NEXT_PUBLIC_SITE_URL`
- `GEMINI_API_KEY`（Google Gemini AI 功能）
- `EMBED_SECRET`（向量重建接口鉴权，默认 `juzi-embed-secret`）

## 架构概览

**框架**：Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS v4

**路由分区**（Route Groups）：
- `src/app/(blog)/` — 前台博客（首页、文章列表/详情、动态、关于）
- `src/app/(admin)/dashboard/` — 后台管理（需登录鉴权）
- `src/app/(auth)/login/` — 登录页

**鉴权流程**：Supabase Auth。`AdminAuthGuard` 组件包裹所有后台页面，通过 `useAuthStore`（Zustand persist）检查 session，未登录跳转 `/login`。

**数据流**：
- `src/lib/supabase.ts` — 单例 Supabase 客户端（使用 anon key）
- `src/services/` — 所有数据请求封装（post、moment、comment），页面直接调用，不在组件内写 Supabase 查询
- `src/app/actions/` — Next.js Server Actions（需要 service role key 或服务端操作，如向量嵌入）
- `src/app/api/` — API Routes（AI 生成、Unsplash 搜索等需要流式响应或隐藏 API Key 的接口）
- `src/stores/` — Zustand 全局状态（auth、theme）

**UI 层**：
- `src/components/ui/` — shadcn/ui 基础组件（只存放，不修改）
- `src/components/blog/` — 前台专用组件
- `src/components/admin/` — 后台专用组件
- `src/components/shared/` — 全局共用（如 ThemeProvider）

**类型**：统一在 `src/types/` 下定义，`src/types/index.ts` 统一导出。常量放 `src/lib/constants.ts`。

## 数据库结构（Supabase）

主要表：`posts`、`categories`、`tags`、`post_tags`（多对多关联）、`moments`、`comments`、`site_settings`、`subscribers`、`media`、`post_chunks`（文章向量块，用于 RAG）

关联查询写法（Supabase PostgREST 嵌套语法）：
```ts
// 文章带分类和标签
supabase.from('posts').select('*, category:categories(*), tags:post_tags(tag:tags(*))')
```

Supabase RPC（需在数据库中提前创建对应函数）：
- `increment_view_count(post_id)` — 文章阅读量自增
- `increment_moment_likes(moment_id)` — 动态点赞数自增
- `match_post_chunks(query_embedding, match_threshold, match_count)` — 向量相似度检索，用于 RAG 问答

**标签写入**：创建/更新文章时，标签需先写 `posts`，再批量 upsert `post_tags`（`{ post_id, tag_id }`），不能通过文章 insert 一步完成。

**评论审核**：评论默认 `status = 'pending'`，前台只展示 `approved`，后台可将状态改为 `approved` / `rejected`。

**Supabase Storage**：媒体文件上传到 `media` bucket，上传后调用 `getPublicUrl` 取公开链接，再将元信息写入 `media` 表。没有独立的 API Route，所有读写直接走客户端 Supabase SDK。

## AI 功能层

所有 AI 功能基于 **Google Gemini**（`src/lib/gemini.ts`）：
- **Embedding 模型**：`gemini-embedding-001`，输出 768 维向量
- **Chat 模型**：`gemini-2.5-flash`，用于问答和写作辅助

**RAG 问答**（前台 AI 聊天框）：
1. 问题 → 生成 Embedding → `match_post_chunks` RPC 检索相关段落
2. 拼接上下文 → Gemini 流式生成回答 → 携带来源文章列表
3. 限流：每 IP 每日 30 次（内存计数，重启清零）

**向量入库时机**：文章发布/更新时，`embedPost(postId)` Server Action 自动触发，将文章 HTML 转纯文本 → 分块 → 批量写入 `post_chunks`。后台 AI 管理页可全量重建。

**后台 AI 写作辅助**（Tiptap 编辑器工具栏）：
- `/api/ai-write` — 选中文字做润色 / 扩写 / 精简 / 续写，流式返回
- `/api/ai-excerpt` — 根据正文自动生成文章摘要
- `/api/ai-tags` — 根据正文推荐标签

## 编辑器与内容渲染

- 文章使用 **Tiptap** 编辑，输出 **HTML 字符串**存入数据库（不是 Markdown）
- 前台渲染用 `dangerouslySetInnerHTML={{ __html: post.content }}`，样式通过 `@tailwindcss/typography` 的 `prose` 类处理
- 代码高亮使用 **Shiki**

## Next.js 15 注意事项

- 动态路由的 `params` 是 **Promise**，必须 `await params` 后再解构：
  ```ts
  export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
  }
  ```


## 开发规范

- **页面文件不超过 400 行**，超出必须拆分成子组件放对应 `components/` 目录
- 新建 service 函数放 `src/services/`，禁止在页面/组件内直接写 Supabase 查询
- 新增 TypeScript 类型放 `src/types/` 对应文件，通过 `index.ts` 导出
- 全局常量放 `src/lib/constants.ts`
- 自定义 Hook 放 `src/hooks/`，Zustand store 放 `src/stores/`
- Git 提交使用前缀：`feat` / `fix` / `style` / `refactor` / `docs`
- 设计风格：深色背景 + 渐变高亮，使用 Framer Motion 添加交互动效
- 动态（Moment）的心情值只能从 `MOOD_OPTIONS`（`src/lib/constants.ts`）中选取，不能自由输入
