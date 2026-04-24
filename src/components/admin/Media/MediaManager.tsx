'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Upload, Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { Media } from '@/types'

interface Props {
  initialMedia: Media[]
}

export function MediaManager({ initialMedia }: Props) {
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)

    let successCount = 0
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (error) {
        toast.error(`上传失败：${error.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)

      const { data: record, error: dbError } = await supabase.from('media').insert({
        url: publicUrl,
        filename: file.name,
        file_type: file.type.startsWith('video') ? 'video' : 'image',
        file_size: file.size,
      }).select().single()

      if (dbError) {
        toast.error(`数据库写入失败：${dbError.message}`)
        continue
      }

      if (record) {
        setMedia((m) => [record, ...m])
        successCount++
      }
    }

    setUploading(false)
    if (successCount > 0) toast.success(`已上传 ${successCount} 个文件`)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('链接已复制')
  }

  const handleDelete = async (id: number, url: string) => {
    const filename = url.split('/').pop()!
    await supabase.storage.from('media').remove([filename])
    await supabase.from('media').delete().eq('id', id)
    setMedia((m) => m.filter((item) => item.id !== id))
    toast.success('已删除')
  }

  return (
    <div>
      {/* 上传区域 */}
      <div
        onClick={() => inputRef.current?.click()}
        className="mb-8 border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium">{uploading ? '上传中...' : '点击或拖拽上传图片'}</p>
        <p className="text-sm text-muted-foreground mt-1">支持 JPG、PNG、GIF、WebP、MP4</p>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* 素材网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {media.map((item) => (
          <div key={item.id} className="group relative rounded-xl overflow-hidden border border-border/50 aspect-square bg-muted">
            <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <p className="text-white text-xs text-center px-2 line-clamp-2">{item.filename}</p>
              <p className="text-white/60 text-xs">{formatDate(item.created_at)}</p>
              <div className="flex gap-2">
                <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => handleCopy(item.url)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDelete(item.id, item.url)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-10">素材库为空，上传第一张图片吧</p>
        )}
      </div>
    </div>
  )
}
