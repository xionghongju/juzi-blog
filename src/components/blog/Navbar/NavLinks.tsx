'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/moments', label: '朋友圈' },
  { href: '/about', label: '关于' },
]

export function NavLinks() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const linkClass = (href: string) =>
    cn(
      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
      pathname === href
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )

  return (
    <>
      {/* 桌面端横排导航 */}
      <nav className="hidden sm:flex items-center gap-1">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            {label}
          </Link>
        ))}
      </nav>

      {/* 移动端汉堡按钮 */}
      <button
        className="sm:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="菜单"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 移动端下拉菜单 */}
      {open && (
        <div className="sm:hidden absolute top-14 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex flex-col gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(href)}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
