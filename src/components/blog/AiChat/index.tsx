'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  text: string
  sources?: { title: string; slug: string }[]
}

const WELCOME: Message = {
  role: 'assistant',
  text: '嗨！我是橘子小助手🍊，可以帮你检索博客文章、回答技术问题。有什么想聊的？',
}

export function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // 构造发送给 API 的历史（跳过欢迎语）
    const history = messages.slice(1).map(m => ({ role: m.role, text: m.text }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', text: err.error || '出错了，请稍后再试' }])
        return
      }

      // 流式读取
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let full = ''
      const assistantMsg: Message = { role: 'assistant', text: '' }
      setMessages(prev => [...prev, assistantMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value, { stream: true })

        // 实时更新（去掉末尾的 source 标记再显示）
        const displayText = full.replace(/\n\n@@SOURCES@@.*$/, '')
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { ...assistantMsg, text: displayText }
          return next
        })
      }

      // 解析来源
      const sourceMatch = full.match(/@@SOURCES@@(.+)$/)
      const sources = sourceMatch ? JSON.parse(sourceMatch[1]) : []
      const finalText = full.replace(/\n\n@@SOURCES@@.*$/, '')

      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', text: finalText, sources }
        return next
      })
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '网络出错，请稍后重试 😅' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        aria-label="AI 助手"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="h-6 w-6" /></motion.div>
            : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Bot className="h-6 w-6" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* 聊天面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🍊</div>
              <div>
                <p className="text-sm font-semibold">橘子小助手</p>
                <p className="text-xs text-muted-foreground">基于博客文章 · Gemini 驱动</p>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      {msg.text}
                      {msg.role === 'assistant' && !msg.text && (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                    {/* 来源文章 */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map(s => (
                          <Link
                            key={s.slug}
                            href={`/posts/${s.slug}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* 输入框 */}
            <div className="px-3 py-3 border-t border-border/50">
              <form
                onSubmit={e => { e.preventDefault(); send() }}
                className="flex gap-2 items-center bg-muted rounded-xl px-3 py-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="问我任何问题..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
