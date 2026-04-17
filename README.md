# juzi-blog

**线上地址：[https://juzi-blog.vercel.app](https://juzi-blog.vercel.app)**

一个基于 Next.js 15 构建的现代个人博客，深度集成 AI 能力——支持 RAG 语义问答、AI 写作辅助，配套完整的后台管理系统。

## 功能亮点

- **RAG AI 问答** — 前台内置 AI 聊天框，文章发布时自动向量化，基于 Gemini Embedding + pgvector 做语义检索，回答时附带来源文章
- **AI 写作辅助** — Tiptap 编辑器内置 AI 工具栏，支持润色 / 扩写 / 精简 / 续写 / 自动摘要 / 标签推荐，全部流式返回
- **动态（Moments）** — 类朋友圈的短内容模块，带心情标签
- **评论系统** — 自建评论，后台支持审核（pending / approved / rejected）
- **邮件订阅** — 集成 Resend，读者可订阅更新
- **媒体库** — 文件上传至 Supabase Storage，后台统一管理
- **完整后台** — 文章、分类、标签、评论、媒体、订阅者、站点设置、AI 向量管理

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 + shadcn/ui |
| 动效 | Framer Motion |
| 数据库 | Supabase (PostgreSQL + pgvector) |
| 状态管理 | Zustand |
| 编辑器 | Tiptap |
| 代码高亮 | Shiki |
| AI | Google Gemini（gemini-2.5-flash + gemini-embedding-001）|
| 邮件 | Resend |
| 部署 | Vercel |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
GEMINI_API_KEY=
EMBED_SECRET=juzi-embed-secret
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
```

## 项目结构

```
src/
├── app/(blog)/          前台页面（首页、文章、动态、关于）
├── app/(admin)/         后台管理（需登录）
├── app/(auth)/          登录页
├── app/api/             API Routes（AI 生成、Unsplash 等）
├── app/actions/         Server Actions（向量嵌入等）
├── components/ui/       shadcn/ui 基础组件
├── components/blog/     前台专用组件
├── components/admin/    后台专用组件
├── components/shared/   全局共用组件
├── hooks/               自定义 Hook
├── stores/              Zustand 状态（auth、theme）
├── services/            数据请求层（封装 Supabase 查询）
├── lib/                 工具函数、常量、客户端
└── types/               TypeScript 类型定义
```

## 数据库

主要表：`posts`、`categories`、`tags`、`post_tags`、`moments`、`comments`、`site_settings`、`subscribers`、`media`、`post_chunks`

需在 Supabase 中提前创建以下 RPC 函数：
- `increment_view_count(post_id)` — 文章阅读量自增
- `increment_moment_likes(moment_id)` — 动态点赞自增
- `match_post_chunks(query_embedding, match_threshold, match_count)` — 向量相似度检索

## 部署

推荐部署到 [Vercel](https://vercel.com)，在项目设置中添加对应的环境变量即可。

## License

MIT
