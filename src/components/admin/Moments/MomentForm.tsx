'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createMoment } from '@/services/moment.service'
import { MOOD_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'
import { Send, ImagePlus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRef } from 'react'

interface Props {
  onCreated: () => void
}

export function MomentForm({ onCreated }: Props) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState('')
  const [location, setLocation] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, file, { cacheControl: '3600', upsert: false })
      if (error) { toast.error('上传失败：' + error.message); continue }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
      urls.push(publicUrl)
    }
    setUploading(false)
    if (imgInputRef.current) imgInputRef.current.value = ''
    if (urls.length === 0) return
    setImages((prev) => {
      const existing = prev.trim()
      return existing ? existing + '\n' + urls.join('\n') : urls.join('\n')
    })
    toast.success(`已上传 ${urls.length} 张图片`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return toast.error('请输入动态内容')
    setLoading(true)

    const imageList = images.split('\n').map((s) => s.trim()).filter(Boolean)
    const { error } = await createMoment({
      content,
      images: imageList.length > 0 ? imageList : undefined,
      location: location || undefined,
      mood: mood || undefined,
    })

    setLoading(false)
    if (error) {
      toast.error('发布失败')
    } else {
      toast.success('动态已发布 🎉')
      setContent('')
      setImages('')
      setLocation('')
      setMood('')
      onCreated()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-border/50 bg-card space-y-4 mb-8">
      <h2 className="font-semibold">发布新动态</h2>

      <div className="space-y-1.5">
        <Label>内容</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享此刻的心情..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>地点（可选）</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="北京" />
        </div>
        <div className="space-y-1.5">
          <Label>心情（可选）</Label>
          <Select value={mood} onValueChange={(v) => setMood(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="选择心情" />
            </SelectTrigger>
            <SelectContent>
              {MOOD_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.emoji} {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>图片（可选）</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground"
            disabled={uploading}
            onClick={() => imgInputRef.current?.click()}
          >
            {uploading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <ImagePlus className="h-3.5 w-3.5" />
            }
            {uploading ? '上传中...' : '本地上传'}
          </Button>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <Textarea
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="粘贴图片 URL（每行一个），或点击右上角按钮上传本地图片"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading}>
        <Send className="h-4 w-4 mr-2" />
        {loading ? '发布中...' : '发布动态'}
      </Button>
    </form>
  )
}
