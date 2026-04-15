'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Eye, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Post } from '@/types'
import { formatDate, truncate } from '@/lib/utils'

interface Props {
  post: Post
  index?: number
}

export function PostCard({ post, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/posts/${post.slug}`}>
        <article className="group relative p-6 rounded-2xl border border-border/50 bg-card card-glow cursor-pointer transition-all duration-300 hover:-translate-y-1">
          {post.cover_image && (
            <div className="mb-4 overflow-hidden rounded-xl aspect-video">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            {post.category && (
              <Badge variant="secondary" className="text-primary">
                {post.category.name}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.view_count}
            </span>
          </div>

          <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          {post.content && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {truncate(post.content.replace(/<[^>]*>/g, ''), 100)}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t.id} variant="outline" className="text-xs">
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
        </article>
      </Link>
    </motion.div>
  )
}
