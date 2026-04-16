export const dynamic = 'force-dynamic'

import { Hero } from '@/components/blog/Hero'
import { PostCard } from '@/components/blog/PostCard'
import { getPosts } from '@/services/post.service'
import { getMoments } from '@/services/moment.service'
import { MomentCard } from '@/components/blog/MomentCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const [{ data: posts, count: postCount }, { data: moments, count: momentCount }] = await Promise.all([
    getPosts(1),
    getMoments(1),
  ])

  return (
    <div className="space-y-16">
      <Hero postCount={postCount ?? 0} momentCount={momentCount ?? 0} />

      {/* 最新文章 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Link
            href="/posts"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            全部文章 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.slice(0, 4).map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">暂无文章，快去写第一篇吧 ✍️</p>
        )}
      </section>

      {/* 最新动态 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最新动态</h2>
          <Link
            href="/moments"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            查看全部 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {moments && moments.length > 0 ? (
          <div className="space-y-4">
            {moments.slice(0, 3).map((moment, i) => (
              <MomentCard key={moment.id} moment={moment} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">还没有动态，记录生活从现在开始 📸</p>
        )}
      </section>
    </div>
  )
}
