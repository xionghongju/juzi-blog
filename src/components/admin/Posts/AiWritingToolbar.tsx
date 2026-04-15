'use client'

import { useState, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  editor: Editor
  selectionRect: DOMRect
  from: number
  to: number
  selectedText: string
  onDone: () => void
}

const ACTIONS = [
  { key: 'polish',   label: '润色' },
  { key: 'expand',   label: '扩写' },
  { key: 'shorten',  label: '缩短' },
  { key: 'continue', label: '续写' },
] as const

export function AiWritingToolbar({ editor, selectionRect, from, to, selectedText, onDone }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // 点击工具栏外部时关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onDone()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onDone])

  const run = async (action: string) => {
    if (loading) return
    setLoading(action)

    try {
      const res = await fetch('/api/ai-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, action }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'AI 处理失败')
        return
      }

      // 流式读取完整结果
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += dec.decode(value, { stream: true })
      }

      // 替换选中内容
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, result).run()
      onDone()
    } catch {
      toast.error('网络错误，请重试')
    } finally {
      setLoading(null)
    }
  }

  // 工具栏定位：fixed 相对视口，出现在选中文字正上方，水平居中
  const top = selectionRect.top - 48
  const centerX = selectionRect.left + selectionRect.width / 2

  return (
    <div
      ref={toolbarRef}
      style={{ position: 'fixed', top, left: centerX, transform: 'translateX(-50%)', zIndex: 9999 }}
      className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg border border-border/60 bg-card shadow-xl shadow-black/20 backdrop-blur-sm"
    >
      <Sparkles className="h-3.5 w-3.5 text-purple-400 mr-1 shrink-0" />
      {ACTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => run(key)}
          disabled={!!loading}
          className="relative px-2.5 py-1 rounded-md text-xs font-medium transition-colors
            hover:bg-purple-500/20 hover:text-purple-300
            disabled:opacity-50 disabled:cursor-not-allowed
            text-foreground/80"
        >
          {loading === key ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {label}
            </span>
          ) : label}
        </button>
      ))}
    </div>
  )
}
