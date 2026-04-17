'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getCommentsByPost, createComment } from '@/services/comment.service'
import { Comment } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  postId: number
}

export function CommentSection({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCommentsByPost(postId).then(({ data }) => setComments(data || []))
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !content.trim()) return

    if (name.trim().length > 50) {
      toast.error('昵称不能超过 50 个字符')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('请输入有效的邮箱地址')
      return
    }
    if (content.trim().length > 1000) {
      toast.error('评论内容不能超过 1000 个字符')
      return
    }

    setLoading(true)
    const { error } = await createComment({
      post_id: postId,
      author_name: name.trim(),
      author_email: email.trim(),
      content: content.trim(),
    })
    setLoading(false)
    if (error) {
      toast.error('评论提交失败，请稍后重试')
    } else {
      toast.success('评论已提交，审核通过后显示 ✨')
      setContent('')
    }
  }

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold mb-6">
        评论 {comments.length > 0 && <span className="text-muted-foreground font-normal text-base">({comments.length})</span>}
      </h2>

      {/* 评论列表 */}
      <div className="space-y-4 mb-10">
        {comments.map((comment, i) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-border/50 bg-muted/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{comment.author_name}</span>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
            </div>
            <p className="text-sm leading-relaxed">{comment.content}</p>
          </motion.div>
        ))}
        {comments.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">还没有评论，来说点什么吧 💬</p>
        )}
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card">
        <h3 className="font-semibold">发表评论</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">昵称 *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="你的昵称" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">邮箱 *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="不会公开显示" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">内容 *</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="写下你的想法..." rows={4} required />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '提交中...' : '提交评论'}
        </Button>
      </form>
    </section>
  )
}
