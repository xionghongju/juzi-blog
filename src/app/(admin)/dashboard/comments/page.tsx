import { getAllComments } from '@/services/comment.service'
import { CommentsManager } from '@/components/admin/Comments/CommentsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '评论管理 - 后台管理' }

export default async function AdminCommentsPage() {
  const { data: comments } = await getAllComments()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">评论管理</h1>
      <CommentsManager comments={comments || []} />
    </div>
  )
}
