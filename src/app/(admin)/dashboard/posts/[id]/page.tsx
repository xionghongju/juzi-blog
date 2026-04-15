import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PostForm } from '@/components/admin/Posts/PostForm'
import { getCategories } from '@/services/category.service'
import { getTags } from '@/services/tag.service'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '编辑文章 - 后台管理' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params

  const [{ data: post }, { data: categories }, { data: tags }, { data: postTags }] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    getCategories(),
    getTags(),
    supabase.from('post_tags').select('tag_id').eq('post_id', id),
  ])

  if (!post) notFound()

  const selectedTagIds = (postTags ?? []).map((r: { tag_id: number }) => r.tag_id)

  return (
    <PostForm
      post={post}
      categories={categories ?? []}
      allTags={tags ?? []}
      initialTagIds={selectedTagIds}
    />
  )
}
