import { Suspense } from 'react'
import { getPosts, searchPosts } from '@/services/post.service'
import { supabase } from '@/lib/supabase'
import { PostCard } from '@/components/blog/PostCard'
import { CategoryFilter } from '@/components/blog/PostList/CategoryFilter'
import { SearchBar } from '@/components/blog/PostList/SearchBar'
import { Pagination } from '@/components/blog/PostList/Pagination'
import { PAGE_SIZE } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '文章' }

interface Props {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page || 1)
  const keyword = params.q || ''

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  let posts = null
  let count = 0

  if (keyword) {
    const { data } = await searchPosts(keyword)
    posts = data
    count = data?.length || 0
  } else {
    let categoryId: number | undefined
    if (params.category) {
      const cat = categories?.find((c) => c.slug === params.category)
      categoryId = cat?.id
    }
    const { data, count: total } = await getPosts(page, categoryId)
    posts = data
    count = total || 0
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        全部文章
        <span className="ml-3 text-lg font-normal text-muted-foreground">({count})</span>
      </h1>

      <SearchBar />

      <Suspense>
        <CategoryFilter categories={categories || []} />
      </Suspense>

      {posts && posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-20">
          {keyword ? `没有找到包含「${keyword}」的文章` : '暂无文章'}
        </p>
      )}

      <Suspense>
        <Pagination page={page} total={count} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
