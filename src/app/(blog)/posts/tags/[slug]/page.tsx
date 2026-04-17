export const revalidate = 60

import { notFound } from 'next/navigation'
import { Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getPostsByTag } from '@/services/post.service'
import { PostCard } from '@/components/blog/PostCard'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: tag } = await supabase.from('tags').select('*').eq('slug', slug).single()
  if (!tag) return { title: '标签不存在' }
  return {
    title: `#${tag.name}`,
    description: `所有标记了「${tag.name}」的文章`,
    alternates: { canonical: `/posts/tags/${slug}` },
  }
}

export default async function TagPostsPage({ params }: Props) {
  const { slug } = await params
  const { data: tag } = await supabase.from('tags').select('*').eq('slug', slug).single()
  if (!tag) notFound()

  const { data: posts } = await getPostsByTag(tag.id)

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">标签</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Hash className="h-7 w-7 text-primary" />
          {tag.name}
          <span className="text-lg font-normal text-muted-foreground">
            ({posts?.length ?? 0})
          </span>
        </h1>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-20">该标签下暂无文章</p>
      )}
    </div>
  )
}
