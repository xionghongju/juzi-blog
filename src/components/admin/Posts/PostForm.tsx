'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Editor } from './Editor'
import { createPost, updatePost } from '@/services/post.service'
import { Post } from '@/types'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import { Save, Globe } from 'lucide-react'

interface Props {
  post?: Post
}

export function PostForm({ post }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [content, setContent] = useState(post?.content || '')
  const [coverImage, setCoverImage] = useState(post?.cover_image || '')
  const [published, setPublished] = useState(post?.status === 'published')
  const [saving, setSaving] = useState(false)

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!post) setSlug(slugify(val))
  }

  const handleSave = async (asPublished?: boolean) => {
    if (!title.trim()) return toast.error('请输入文章标题')
    if (!slug.trim()) return toast.error('请输入文章 Slug')

    setSaving(true)
    const status: 'published' | 'draft' = asPublished !== undefined ? (asPublished ? 'published' : 'draft') : (published ? 'published' : 'draft')
    const data = {
      title, slug, content,
      cover_image: coverImage || undefined,
      status,
      published_at: status === 'published' ? (post?.published_at || new Date().toISOString()) : undefined,
    }

    const { error } = post
      ? await updatePost(post.id, data)
      : await createPost(data)

    setSaving(false)

    if (error) {
      toast.error('保存失败：' + error.message)
    } else {
      toast.success(status === 'published' ? '已发布 🎉' : '已保存为草稿')
      router.push('/dashboard/posts')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{post ? '编辑文章' : '写文章'}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>发布</span>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            存草稿
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '发布'}
          </Button>
        </div>
      </div>

      {/* 标题 */}
      <div className="space-y-1.5">
        <Label>文章标题</Label>
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="输入文章标题..."
          className="text-lg font-medium h-12"
        />
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <Label>Slug（URL 路径）</Label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="post-url-slug"
          className="font-mono text-sm"
        />
      </div>

      {/* 封面图 */}
      <div className="space-y-1.5">
        <Label>封面图 URL（可选）</Label>
        <Input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* 编辑器 */}
      <div className="space-y-1.5">
        <Label>正文内容</Label>
        <Editor content={content} onChange={setContent} />
      </div>
    </div>
  )
}
