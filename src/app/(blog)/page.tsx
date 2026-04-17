export const revalidate = 60 // ISR：每 60 秒重新生成，兼顾新鲜度与性能

import { Hero } from '@/components/blog/Hero'
import { PostCard } from '@/components/blog/PostCard'
import { getPosts } from '@/services/post.service'
import { getMoments } from '@/services/moment.service'
import { MomentCard } from '@/components/blog/MomentCard'
import { AnimatedSection } from '@/components/blog/AnimatedSection'
import { SectionHeading } from '@/components/blog/SectionHeading'
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
      <AnimatedSection>
        <div className="flex items-center justify-between mb-6">
          <SectionHeading>最新文章</SectionHeading>
          <Link
            href="/posts"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            全部文章 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            <PostCard post={posts[0]} index={0} featured />
            {posts.slice(1, 4).map((post, i) => (
              <PostCard key={post.id} post={post} index={i + 1} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">暂无文章，快去写第一篇吧 ✍️</p>
        )}
      </AnimatedSection>

      {/* 最新动态 */}
      <AnimatedSection delay={0.1}>
        <div className="flex items-center justify-between mb-6">
          <SectionHeading>最新动态</SectionHeading>
          <Link
            href="/moments"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            查看全部 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {moments && moments.length > 0 ? (
          <div>
            {moments.slice(0, 3).map((moment, i, arr) => (
              <MomentCard key={moment.id} moment={moment} index={i} isLast={i === arr.length - 1} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">还没有动态，记录生活从现在开始 📸</p>
        )}
      </AnimatedSection>
    </div>
  )
}
