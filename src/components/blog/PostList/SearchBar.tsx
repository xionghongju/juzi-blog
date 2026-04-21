'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Clock, Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 5

function loadHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(keyword: string) {
  const prev = loadHistory().filter(k => k !== keyword)
  localStorage.setItem(HISTORY_KEY, JSON.stringify([keyword, ...prev].slice(0, MAX_HISTORY)))
}

function removeHistory(keyword: string) {
  const next = loadHistory().filter(k => k !== keyword)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
}

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<{ title: string; slug: string }[]>([])
  const [history, setHistory] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (!keyword.trim()) { setSuggestions([]); return }
    const { data } = await supabase
      .from('posts')
      .select('title, slug')
      .eq('status', 'published')
      .ilike('title', `%${keyword}%`)
      .limit(5)
    setSuggestions(data || [])
  }, [])

  const navigate = useCallback((keyword: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (keyword) {
        params.set('q', keyword)
        saveHistory(keyword)
        setHistory(loadHistory())
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.push(`/posts?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleChange = (keyword: string) => {
    setValue(keyword)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(keyword)
      navigate(keyword)
    }, 350)
  }

  const handleSelect = (keyword: string) => {
    setValue(keyword)
    setSuggestions([])
    setFocused(false)
    navigate(keyword)
  }

  const handleDeleteHistory = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation()
    removeHistory(keyword)
    setHistory(loadHistory())
  }

  const showDropdown = focused && (suggestions.length > 0 || (history.length > 0 && !value))

  return (
    <div ref={containerRef} className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { setFocused(true); setHistory(loadHistory()) }}
        placeholder="搜索文章..."
        className="pl-10 rounded-xl bg-muted/50"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {/* 搜索历史（输入框为空时） */}
          {!value && history.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/50">最近搜索</div>
              {history.map((kw) => (
                <div
                  key={kw}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted/60 cursor-pointer group"
                  onMouseDown={() => handleSelect(kw)}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {kw}
                  </span>
                  <button
                    onMouseDown={(e) => handleDeleteHistory(e, kw)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* 搜索建议（输入时） */}
          {value && suggestions.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/50">相关文章</div>
              {suggestions.map((s) => (
                <div
                  key={s.slug}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/60 cursor-pointer text-sm"
                  onMouseDown={() => handleSelect(s.title)}
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{s.title}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
