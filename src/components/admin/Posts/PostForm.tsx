'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Editor } from './Editor'
import { createPost, updatePost, syncPostTags } from '@/services/post.service'
import { Post, Category, Tag } from '@/types'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import { Save, Globe, Sparkles, Loader2 } from 'lucide-react'
import { ImageUploadInput } from '@/components/admin/shared/ImageUploadInput'
import { TagInput } from './TagInput'
import { computeRelatedPosts } from '@/app/actions/related-posts'
import { embedPost } from '@/app/actions/embed-post'

interface Props {
  post?: Post
  categories: Category[]
  allTags: Tag[]
  initialTagIds?: number[]
}

export function PostForm({ post, categories, allTags, initialTagIds = [] }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [content, setContent] = useState(post?.content || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [coverImage, setCoverImage] = useState(post?.cover_image || '')
  const [published, setPublished] = useState(post?.status === 'published')
  const [categoryId, setCategoryId] = useState<number | undefined>(post?.category_id)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialTagIds)
  const [saving, setSaving] = useState(false)
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false)
  const [suggestingTags, setSuggestingTags] = useState(false)

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!post) setSlug(slugify(val))
  }

  /** AI 生成摘要（流式） */
  const handleGenerateExcerpt = async () => {
    if (!content.trim()) return toast.error('请先输入正文内容')
    setGeneratingExcerpt(true)
    setExcerpt('')

    try {
      const res = await fetch('/api/ai-excerpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'AI 生成失败')
        return
      }

      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += dec.decode(value, { stream: true })
        setExcerpt(result)
      }
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setGeneratingExcerpt(false)
    }
  }

  /** AI 推荐标签 */
  const handleSuggestTags = async () => {
    if (!content.trim()) return toast.error('请先输入正文内容')
    if (!allTags.length) return toast.error('请先在标签管理中添加标签')
    setSuggestingTags(true)

    try {
      const res = await fetch('/api/ai-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, tags: allTags }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || 'AI 推荐失败')
        return
      }
      const suggested: number[] = data.ids ?? []
      if (!suggested.length) {
        toast.info('未找到相关标签，请手动选择')
        return
      }
      setSelectedTagIds(prev => Array.from(new Set([...prev, ...suggested])))
      toast.success(`AI 推荐了 ${suggested.length} 个标签`)
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setSuggestingTags(false)
    }
  }

  const handleSave = async (asPublished?: boolean) => {
    if (!title.trim()) return toast.error('请输入文章标题')
    if (!slug.trim()) return toast.error('请输入文章 Slug')

    setSaving(true)
    const status: 'published' | 'draft' = asPublished !== undefined
      ? (asPublished ? 'published' : 'draft')
      : (published ? 'published' : 'draft')

    const data = {
      title, slug, content,
      excerpt: excerpt.trim() || undefined,
      cover_image: coverImage || undefined,
      category_id: categoryId,
      status,
      published_at: status === 'published' ? (post?.published_at || new Date().toISOString()) : undefined,
    }

    const result = post
      ? await updatePost(post.id, data)
      : await createPost(data)

    if (result.error) {
      setSaving(false)
      toast.error('保存失败：' + result.error.message)
      return
    }

    const postId = result.data!.id
    await syncPostTags(postId, selectedTagIds)

    setSaving(false)
    toast.success(status === 'published' ? '已发布 🎉' : '已保存为草稿')

    if (status === 'published') {
      embedPost(postId).catch(() => {})
      computeRelatedPosts(postId).catch(() => {})
    }

    router.push('/dashboard/posts')
    router.refresh()
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

      {/* 分类 + 标签 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 分类 */}
        <div className="space-y-1.5">
          <Label>分类</Label>
          <Select
            value={categoryId?.toString() ?? ''}
            onValueChange={(v) => setCategoryId(v ? Number(v) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择分类（可选）" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryId && (
            <button
              type="button"
              onClick={() => setCategoryId(undefined)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
            >
              <X className="h-3 w-3" /> 清除分类
            </button>
          )}
        </div>

        {/* 标签 */}
        <div className="space-y-1.5">
          <Label>标签</Label>
          <TagInput
            allTags={allTags}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            onSuggest={handleSuggestTags}
            suggesting={suggestingTags}
          />
        </div>
      </div>

      {/* 封面图 */}
      <div className="space-y-1.5">
        <Label>封面图（可选）</Label>
        <ImageUploadInput
          value={coverImage}
          onChange={setCoverImage}
          placeholder="粘贴图片 URL 或点击右侧按钮上传"
          label="封面图预览"
          suggestQuery={title.trim() || undefined}
        />
      </div>

      {/* 摘要 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>
            文章摘要
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">（用于 SEO 和文章卡片预览）</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateExcerpt}
            disabled={generatingExcerpt}
            className="h-6 gap-1 text-xs text-purple-400 hover:text-purple-300 px-2"
          >
            {generatingExcerpt
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Sparkles className="h-3 w-3" />}
            AI 生成
          </Button>
        </div>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="输入文章摘要，或点击「AI 生成」自动生成..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground text-right">{excerpt.length} 字</p>
      </div>

      {/* 编辑器 */}
      <div className="space-y-1.5">
        <Label>正文内容</Label>
        <Editor content={content} onChange={setContent} />
      </div>
    </div>
  )
}
