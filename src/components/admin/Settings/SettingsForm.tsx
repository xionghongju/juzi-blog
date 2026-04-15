'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { ImageUploadInput } from '@/components/admin/shared/ImageUploadInput'

interface Settings {
  id: number
  site_name: string
  description?: string
  avatar?: string
  github_url?: string
  twitter_url?: string
  beian?: string
}

interface Props {
  settings: Settings
}

export function SettingsForm({ settings: initial }: Props) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  const set = (key: keyof Settings, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('site_settings')
      .update({
        site_name: form.site_name,
        description: form.description,
        avatar: form.avatar,
        github_url: form.github_url,
        twitter_url: form.twitter_url,
        beian: form.beian,
      })
      .eq('id', form.id)
    setSaving(false)
    if (error) toast.error('保存失败')
    else toast.success('设置已保存 ✓')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <Label>博客名称</Label>
        <Input value={form.site_name || ''} onChange={(e) => set('site_name', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>博客简介</Label>
        <Textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label>头像</Label>
        <ImageUploadInput
          value={form.avatar || ''}
          onChange={(url) => set('avatar', url)}
          placeholder="粘贴头像 URL 或点击右侧按钮上传"
          label="头像预览"
        />
      </div>
      <div className="space-y-1.5">
        <Label>GitHub 链接</Label>
        <Input value={form.github_url || ''} onChange={(e) => set('github_url', e.target.value)} placeholder="https://github.com/..." />
      </div>
      <div className="space-y-1.5">
        <Label>Twitter / X 链接</Label>
        <Input value={form.twitter_url || ''} onChange={(e) => set('twitter_url', e.target.value)} placeholder="https://x.com/..." />
      </div>
      <div className="space-y-1.5">
        <Label>备案号（可选）</Label>
        <Input value={form.beian || ''} onChange={(e) => set('beian', e.target.value)} placeholder="京ICP备XXXXXXXX号" />
      </div>
      <Button type="submit" disabled={saving}>
        <Save className="h-4 w-4 mr-2" />
        {saving ? '保存中...' : '保存设置'}
      </Button>
    </form>
  )
}
