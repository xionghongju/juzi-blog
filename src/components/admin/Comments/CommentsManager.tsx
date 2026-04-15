'use client'

import { useState } from 'react'
import { Comment } from '@/types'
import { updateCommentStatus, deleteComment } from '@/services/comment.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  comments: Comment[]
}

export function CommentsManager({ comments: initial }: Props) {
  const [comments, setComments] = useState(initial)
  const [tab, setTab] = useState('pending')

  const filtered = comments.filter((c) => c.status === tab)

  const handleApprove = async (id: number) => {
    await updateCommentStatus(id, 'approved')
    setComments((c) => c.map((item) => item.id === id ? { ...item, status: 'approved' as const } : item))
    toast.success('已通过')
  }

  const handleReject = async (id: number) => {
    await updateCommentStatus(id, 'rejected')
    setComments((c) => c.map((item) => item.id === id ? { ...item, status: 'rejected' as const } : item))
    toast.success('已拒绝')
  }

  const handleDelete = async (id: number) => {
    await deleteComment(id)
    setComments((c) => c.filter((item) => item.id !== id))
    toast.success('已删除')
  }

  const count = (status: string) => comments.filter((c) => c.status === status).length

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">待审核 {count('pending') > 0 && `(${count('pending')})`}</TabsTrigger>
          <TabsTrigger value="approved">已通过</TabsTrigger>
          <TabsTrigger value="rejected">已拒绝</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((comment) => (
          <div key={comment.id} className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{comment.author_name}</span>
                  <span className="text-xs text-muted-foreground">{comment.author_email}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {comment.post_id ? '文章评论' : '动态评论'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{comment.content}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {comment.status === 'pending' && (
                  <>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-500" onClick={() => handleApprove(comment.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-orange-500 hover:text-orange-500" onClick={() => handleReject(comment.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(comment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">暂无{tab === 'pending' ? '待审核' : tab === 'approved' ? '已通过' : '已拒绝'}评论</p>
        )}
      </div>
    </div>
  )
}
