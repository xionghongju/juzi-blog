import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PostForm } from '@/components/admin/Posts/PostForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '编辑文章 - 后台管理' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()
  if (!post) notFound()
  return <PostForm post={post} />
}
