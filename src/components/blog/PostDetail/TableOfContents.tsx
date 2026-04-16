'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState('')

  useEffect(() => {
    const els = document.querySelectorAll('.prose h2, .prose h3')
    const items: Heading[] = Array.from(els).map((el, i) => {
      // 若标题没有 id，自动生成一个并写回 DOM，使锚点跳转正常工作
      if (!el.id) {
        const generated = `heading-${i}-${(el.textContent || '').trim().slice(0, 20).replace(/\s+/g, '-')}`
        el.id = generated
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: Number(el.tagName[1]),
      }
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(items)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-20% 0% -70% 0%' }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">目录</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={cn(
            'block text-sm py-0.5 transition-colors hover:text-primary',
            h.level === 3 && 'pl-4',
            active === h.id ? 'text-primary font-medium' : 'text-muted-foreground'
          )}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}
