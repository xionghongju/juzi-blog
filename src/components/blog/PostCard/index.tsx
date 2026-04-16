'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Eye, Tag, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Post } from '@/types'
import { formatDate, truncate } from '@/lib/utils'

interface Props {
  post: Post
  index?: number
  featured?: boolean
}

export function PostCard({ post, index = 0, featured = false }: Props) {
  /* ── 精选横版卡（首页第一篇） ── */
  if (featured) {
    return (
      <motion.div
        className="md:col-span-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href={`/posts/${post.slug}`} className="block group">
          <article className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden border border-white/10 bg-card hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_8px_48px_rgba(168,85,247,0.22)]">
            {/* 封面 */}
            <div className="md:w-[52%] aspect-video md:aspect-auto shrink-0 overflow-hidden bg-muted relative">
              {post.cover_image ? (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-900/40 to-pink-900/30">📝</div>
              )}
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60 hidden md:block" />
            </div>

            {/* 文字内容 */}
            <div className="flex flex-col justify-center gap-4 p-7 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {post.category && (
                  <Badge variant="secondary" className="text-primary text-xs">
                    {post.category.name}
                  </Badge>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.published_at || post.created_at)}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {post.view_count}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>

              {post.content && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.excerpt || truncate(post.content.replace(/<[^>]*>/g, ''), 160)}
                </p>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {post.tags.slice(0, 4).map((t) => (
                    <Badge key={t.id} variant="outline" className="text-xs">
                      {t.name}
                    </Badge>
                  ))}
                </div>
              )}

              <span className="flex items-center gap-1.5 text-sm text-primary font-medium mt-1 group-hover:gap-2.5 transition-all">
                阅读全文 <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </article>
        </Link>
      </motion.div>
    )
  }

  /* ── 普通卡片 ── */
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/posts/${post.slug}`} className="h-full block group">
        <article className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-card hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(168,85,247,0.2)] hover:-translate-y-1">

          {/* 封面图 */}
          <div className="relative aspect-video shrink-0 overflow-hidden bg-muted">
            {post.cover_image ? (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-900/40 to-pink-900/30">
                📝
              </div>
            )}

            {/* 图片底部渐变 */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />

            {/* 分类 badge 叠在图片上 */}
            {post.category && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-primary text-xs backdrop-blur-sm bg-background/70">
                  {post.category.name}
                </Badge>
              </div>
            )}
          </div>

          {/* 内容区 */}
          <div className="flex flex-col flex-1 p-5 gap-2.5">
            {/* 元信息 */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.view_count}
              </span>
            </div>

            {/* 标题 */}
            <h2 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>

            {/* 摘要 */}
            <p className="flex-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt || truncate(post.content?.replace(/<[^>]*>/g, '') || '', 90)}
            </p>

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-auto pt-1 border-t border-border/30">
                <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                {post.tags.slice(0, 3).map((t) => (
                  <Badge key={t.id} variant="outline" className="text-xs">
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
