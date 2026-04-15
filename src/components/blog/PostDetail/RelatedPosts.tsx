import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface RelatedPost {
  id: number
  title: string
  slug: string
  cover_image: string | null
  published_at: string | null
}

interface Props {
  posts: RelatedPost[]
}

export function RelatedPosts({ posts }: Props) {
  if (!posts.length) return null

  return (
    <div className="mt-16 pt-10 border-t border-border/50">
      <h2 className="text-lg font-semibold mb-5 text-foreground">你可能也喜欢</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group flex flex-col rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/40 hover:bg-card transition-all duration-200"
          >
            {/* 封面图 */}
            <div className="aspect-video overflow-hidden bg-muted">
              {post.cover_image ? (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">📝</div>
              )}
            </div>

            {/* 信息 */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </p>
              {post.published_at && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.published_at)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
