'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, RefreshCw, Check } from 'lucide-react'
import { toast } from 'sonner'

interface UnsplashPhoto {
  id: string
  small: string
  regular: string
  alt: string
  author: string
  authorUrl: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  initialQuery?: string
}

export function UnsplashPicker({ open, onClose, onSelect, initialQuery }: Props) {
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentQueryRef = useRef('')

  const search = useCallback(async (q: string, p = 1) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    currentQueryRef.current = q

    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(q)}&page=${p}`)
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
  }, [])

  useEffect(() => {
    if (!open) return
    setPage(1)
    setSelectedId(null)
    if (initialQuery?.trim()) {
      setQuery(initialQuery)
      search(initialQuery, 1)
    } else {
      setQuery('')
      setPhotos([])
      setSearched(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, initialQuery, search])

  const handleSearch = () => {
    setPage(1)
    search(query, 1)
  }

  const handleNextBatch = () => {
    const next = page + 1
    setPage(next)
    search(currentQueryRef.current || query, next)
  }

  const handleSelect = (photo: UnsplashPhoto) => {
    setSelectedId(photo.id)
    onSelect(photo.regular)
    toast.success('封面图已设置')
    setTimeout(onClose, 300)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle>
            {initialQuery ? `推荐封面 · ${initialQuery}` : '从 Unsplash 搜图'}
          </DialogTitle>
        </DialogHeader>

        {/* 搜索栏 */}
        <div className="px-6 py-4 flex gap-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            placeholder="输入关键词，如：technology、nature、minimal..."
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            搜索
          </Button>
        </div>

        {/* 图片网格 */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
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
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => handleSelect(photo)}
                  className="group relative rounded-xl overflow-hidden aspect-video bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <img
                    src={photo.small}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                    draggable={false}
                  />

                  {/* 选中状态 */}
                  {selectedId === photo.id && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* hover 遮罩：仅显示「点击选用」文字，作者信息移到外部 */}
                  {selectedId !== photo.id && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none">
                      <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded-full">
                        点击选用
                      </span>
                    </div>
                  )}

                  {/* 作者署名：仅展示文字，不可点击，避免误触 */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                    <span className="text-white/60 text-[10px] truncate block">
                      {photo.author}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部：换一批 + 版权 */}
        {!loading && photos.length > 0 && (
          <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextBatch}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              换一批
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
