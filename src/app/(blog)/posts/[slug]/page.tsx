import { notFound } from 'next/navigation'
import { getPostBySlug, incrementViewCount } from '@/services/post.service'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Eye, Tag } from 'lucide-react'
import { formatDate, estimateReadingTime } from '@/lib/utils'
import { Tag as TagType } from '@/types'
import { TableOfContents } from '@/components/blog/PostDetail/TableOfContents'
import { ReadingProgress } from '@/components/blog/PostDetail/ReadingProgress'
import { CommentSection } from '@/components/blog/PostDetail/CommentSection'
import { RelatedPosts } from '@/components/blog/PostDetail/RelatedPosts'
import { CodeCopyButtons } from '@/components/blog/PostDetail/CodeCopyButtons'
import { getRelatedPosts } from '@/services/post.service'
import { SITE_CONFIG } from '@/lib/constants'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: post } = await getPostBySlug(slug)
  if (!post) return { title: '文章不存在' }

  // 优先用 excerpt 字段，否则从正文提取前 120 字
  const plainText = post.excerpt ||
    (post.content
      ? post.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120)
      : '')

  const url = `${SITE_CONFIG.url}/posts/${slug}`
  return {
    title: post.title,
    description: plainText || undefined,
    alternates: { canonical: `/posts/${slug}` },
    openGraph: {
      title: post.title,
      description: plainText || undefined,
      url,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      ...(post.cover_image ? { images: [{ url: post.cover_image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: post.cover_image ? 'summary_large_image' : 'summary',
      title: post.title,
      description: plainText || undefined,
      ...(post.cover_image ? { images: [post.cover_image] } : {}),
    },
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params
  const { data: post } = await getPostBySlug(slug)
  if (!post) notFound()

  const [, { data: relatedRaw }] = await Promise.all([
    incrementViewCount(post.id),
    getRelatedPosts(post.id),
  ])

  const relatedPosts = (relatedRaw ?? []).map((r: { post: unknown }) => r.post as {
    id: number; title: string; slug: string; cover_image: string | null; published_at: string | null
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    url: `${SITE_CONFIG.url}/posts/${slug}`,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: SITE_CONFIG.name, url: SITE_CONFIG.url },
    publisher: { '@type': 'Person', name: SITE_CONFIG.name, url: SITE_CONFIG.url },
    ...(post.cover_image ? { image: post.cover_image } : {}),
    ...(post.tags?.length ? { keywords: post.tags.map(({ tag }: { tag: TagType }) => tag.name).join(', ') } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <div className="flex gap-6">
        {/* 主内容 */}
        <article className="flex-1 min-w-0">
          {/* 封面 */}
          {post.cover_image && (
            <div className="mb-8 overflow-hidden rounded-2xl aspect-video">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
            {post.category && <Badge variant="secondary" className="text-primary">{post.category.name}</Badge>}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.view_count} 次阅读
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              约 {estimateReadingTime(post.content || '')} 分钟
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map(({ tag }: { tag: TagType }) => (
                <Badge key={tag.id} variant="outline">{tag.name}</Badge>
              ))}
            </div>
          )}

          <CodeCopyButtons />

          {/* 正文 */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:scroll-mt-20 prose-headings:font-bold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          <RelatedPosts posts={relatedPosts} />

          <CommentSection postId={post.id} />
        </article>

        {/* 目录侧边栏 */}
        <aside className="hidden lg:block w-36 shrink-0">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </aside>
      </div>
    </>
  )
}
