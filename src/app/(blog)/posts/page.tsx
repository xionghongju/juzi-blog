export const revalidate = 60

import { Suspense } from 'react'
import { getPosts, searchPosts } from '@/services/post.service'
import { supabase } from '@/lib/supabase'
import { PostCard } from '@/components/blog/PostCard'
import { CategoryFilter } from '@/components/blog/PostList/CategoryFilter'
import { SearchBar } from '@/components/blog/PostList/SearchBar'
import { Pagination } from '@/components/blog/PostList/Pagination'
import { PAGE_SIZE } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '文章',
  description: '全部技术文章与生活随笔，涵盖前端开发、全栈实践、开源工具等内容。',
  alternates: { canonical: '/posts' },
}

interface Props {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page || 1)
  const keyword = params.q || ''
  const categorySlug = params.category

  let categories = null
  let posts = null
  let count = 0

  if (keyword) {
    const [{ data: cats }, { data: results }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      searchPosts(keyword),
    ])
    categories = cats
    posts = results
    count = results?.length || 0
  } else if (categorySlug) {
    const { data: cats } = await supabase.from('categories').select('*').order('name')
    categories = cats
    const categoryId = cats?.find((c) => c.slug === categorySlug)?.id
    const { data, count: total } = await getPosts(page, categoryId)
    posts = data
    count = total || 0
  } else {
    const [{ data: cats }, { data, count: total }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      getPosts(page),
    ])
    categories = cats
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
        <CategoryFilter categories={categories ?? []} />
      </Suspense>

      {posts && posts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
