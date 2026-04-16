'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface UnsplashPhoto {
  id: string
  small: string
  regular: string
  alt: string
  author: string
  authorUrl: string
  photoUrl: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export function UnsplashPicker({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || '搜索失败')
        setPhotos([])
        return
      }
      setPhotos(data.results)
      if (data.results.length === 0) toast.info('没有找到相关图片，换个关键词试试')
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (photo: UnsplashPhoto) => {
    onSelect(photo.regular)
    toast.success('封面图已设置')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle>从 Unsplash 搜图</DialogTitle>
        </DialogHeader>

        {/* 搜索栏 */}
        <div className="px-6 py-4 flex gap-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="输入关键词，如：technology、nature、minimal..."
            autoFocus
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            搜索
          </Button>
        </div>

        {/* 图片网格 */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {!searched && (
            <div className="text-center text-muted-foreground text-sm py-16">
              输入关键词搜索免费高清图片
            </div>
          )}

          {searched && !loading && photos.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-16">
              没有找到相关图片
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && photos.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative cursor-pointer rounded-xl overflow-hidden aspect-video bg-muted"
                    onClick={() => handleSelect(photo)}
                  >
                    <img
                      src={photo.small}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* hover 遮罩 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        点击选用
                      </span>
                    </div>
                    {/* 作者信息 */}
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`${photo.authorUrl}?utm_source=juzi_blog&utm_medium=referral`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/80 text-[10px] hover:text-white flex items-center gap-1"
                      >
                        {photo.author}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                图片来自{' '}
                <a
                  href="https://unsplash.com/?utm_source=juzi_blog&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Unsplash
                </a>
                ，免费商用
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
