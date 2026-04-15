import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getAllPosts } from '@/services/post.service'
import { PostsTable } from '@/components/admin/Posts/PostsTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '文章管理 - 后台管理' }

export default async function AdminPostsPage() {
  const { data: posts } = await getAllPosts()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link href="/dashboard/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            写文章
          </Button>
        </Link>
      </div>

      <PostsTable posts={posts || []} />
    </div>
  )
}
