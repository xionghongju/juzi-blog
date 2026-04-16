'use client'

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, X, Image, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { UnsplashPicker } from './UnsplashPicker'

interface Props {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  label?: string
  suggestQuery?: string  // 传入时显示「推荐封面」按钮，点击自动搜索
}

export function ImageUploadInput({ value, onChange, placeholder = 'https://...', label, suggestQuery }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [unsplashOpen, setUnsplashOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState<string | undefined>(undefined)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''

    if (error) {
      toast.error('上传失败：' + error.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
    onChange(publicUrl)
    toast.success('图片已上传')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        {suggestQuery && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setPickerQuery(suggestQuery); setUnsplashOpen(true) }}
            title="根据文章标题自动推荐封面图"
            className="gap-1.5 text-xs text-purple-400 hover:text-purple-300 px-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            推荐封面
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => { setPickerQuery(undefined); setUnsplashOpen(true) }}
          title="从 Unsplash 搜图"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          title="从本地上传图片"
        >
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ImagePlus className="h-4 w-4" />
          }
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <UnsplashPicker
        open={unsplashOpen}
        onClose={() => setUnsplashOpen(false)}
        onSelect={onChange}
        initialQuery={pickerQuery}
      />

      {value && (
        <div className="relative w-fit">
          <img
            src={value}
            alt={label || '预览'}
            className="h-24 w-24 object-cover rounded-xl border border-border"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
