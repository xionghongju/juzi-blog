'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, CornerDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getCommentsWithReplies, createComment } from '@/services/comment.service'
import { Comment } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  postId: number
}

interface CommentItemProps {
  comment: Comment
  onReply: (comment: Comment) => void
}

function CommentItem({ comment, onReply }: CommentItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 主评论 */}
      <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">{comment.author_name}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
        </div>
        <p className="text-sm leading-relaxed">{comment.content}</p>
        <button
          onClick={() => onReply(comment)}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          回复
        </button>
      </div>

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="flex gap-2"
            >
              <CornerDownRight className="h-4 w-4 mt-3 text-muted-foreground/50 shrink-0" />
              <div className="flex-1 p-3 rounded-lg border border-border/30 bg-muted/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-xs">{reply.author_name}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(reply.created_at)}</span>
                </div>
                <p className="text-sm leading-relaxed">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export function CommentSection({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<Comment | null>(null)

  const fetchComments = async () => {
    const { data } = await getCommentsWithReplies(postId)
    setComments(data || [])
  }

  useEffect(() => { fetchComments() }, [postId])

  const handleReply = (comment: Comment) => {
    setReplyTo(comment)
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

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
    let error
    try {
      ;({ error } = await createComment({
        post_id: postId,
        parent_id: replyTo?.id,
        author_name: name.trim(),
        author_email: email.trim(),
        content: content.trim(),
      }))
    } finally {
      setLoading(false)
    }

    if (error) {
      toast.error('评论提交失败，请稍后重试')
    } else {
      toast.success('评论已提交，审核通过后显示 ✨')
      setContent('')
      setReplyTo(null)
    }
  }

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length ?? 0),
    0
  )

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold mb-6">
        评论{totalCount > 0 && (
          <span className="ml-2 text-lg font-normal text-muted-foreground">({totalCount})</span>
        )}
      </h2>

      {/* 评论列表 */}
      <div className="space-y-4 mb-10">
        {comments.map((comment, i) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CommentItem comment={comment} onReply={handleReply} />
          </motion.div>
        ))}
        {comments.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">
            还没有评论，来说点什么吧 💬
          </p>
        )}
      </div>

      {/* 评论表单 */}
      <form id="comment-form" onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card">
        {/* 回复提示条 */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm"
            >
              <span className="text-muted-foreground">
                回复 <span className="text-foreground font-medium">@{replyTo.author_name}</span>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <h3 className="font-semibold">{replyTo ? '写下回复' : '发表评论'}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">昵称 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的昵称"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="不会公开显示"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">内容 *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? `回复 @${replyTo.author_name}...` : '写下你的想法...'}
            rows={4}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? '提交中...' : '提交评论'}
        </Button>
      </form>
    </section>
  )
}
