import { PostForm } from '@/components/admin/Posts/PostForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '写文章 - 后台管理' }

export default function NewPostPage() {
  return <PostForm />
}
