'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/moments', label: '朋友圈' },
  { href: '/about', label: '关于' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            pathname === href
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
