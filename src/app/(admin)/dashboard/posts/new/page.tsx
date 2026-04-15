import { PostForm } from '@/components/admin/Posts/PostForm'
import { getCategories } from '@/services/category.service'
import { getTags } from '@/services/tag.service'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '写文章 - 后台管理' }

export default async function NewPostPage() {
  const [{ data: categories }, { data: tags }] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  return <PostForm categories={categories ?? []} allTags={tags ?? []} />
}
