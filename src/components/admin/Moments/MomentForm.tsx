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
import { Send } from 'lucide-react'

interface Props {
  onCreated: () => void
}

export function MomentForm({ onCreated }: Props) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState('')
  const [location, setLocation] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)

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
        <Label>图片 URL（每行一个，可选）</Label>
        <Textarea
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
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
