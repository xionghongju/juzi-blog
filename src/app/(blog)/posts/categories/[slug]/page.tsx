export const revalidate = 60

import { notFound } from 'next/navigation'
import { Folder } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getPostsByCategory } from '@/services/post.service'
import { PostCard } from '@/components/blog/PostCard'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (!cat) return { title: '分类不存在' }
  return {
    title: cat.name,
    description: cat.description || `所有「${cat.name}」分类的文章`,
    alternates: { canonical: `/posts/categories/${slug}` },
  }
}

export default async function CategoryPostsPage({ params }: Props) {
  const { slug } = await params
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (!cat) notFound()

  const { data: posts } = await getPostsByCategory(cat.id)

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">分类</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Folder className="h-7 w-7 text-primary" />
          {cat.name}
          <span className="text-lg font-normal text-muted-foreground">
            ({posts?.length ?? 0})
          </span>
        </h1>
        {cat.description && (
          <p className="mt-3 text-muted-foreground">{cat.description}</p>
        )}
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-20">该分类下暂无文章</p>
      )}
    </div>
  )
}
