'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { Post } from '@/types'
import { formatDate } from '@/lib/utils'
import { deletePost, updatePost } from '@/services/post.service'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from '@/components/ui/dialog'

interface Props {
  posts: Post[]
}

export function PostsTable({ posts: initialPosts }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await deletePost(deleteId)
    if (error) {
      toast.error('删除失败')
    } else {
      setPosts((p) => p.filter((post) => post.id !== deleteId))
      toast.success('已删除')
    }
    setDeleteId(null)
  }

  const handleToggleStatus = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const { error } = await updatePost(post.id, {
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : undefined,
    })
    if (!error) {
      setPosts((p) => p.map((p) => p.id === post.id ? { ...p, status: newStatus } : p))
      toast.success(newStatus === 'published' ? '已发布' : '已转为草稿')
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">标题</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">阅读</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">时间</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, i) => (
              <motion.tr
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium line-clamp-1">{post.title}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={post.status === 'published' ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleToggleStatus(post)}
                  >
                    {post.status === 'published' ? '已发布' : '草稿'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{post.view_count}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(post.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {post.status === 'published' && (
                      <Link href={`/posts/${post.slug}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/posts/${post.id}`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="icon" variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-16">暂无文章</p>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>删除后无法恢复，确定要删除这篇文章吗？</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>删除</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
