import Link from 'next/link'
import { NavLinks } from './NavLinks'
import { ThemeToggle } from './ThemeToggle'
import { SITE_CONFIG } from '@/lib/constants'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm relative">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-gradient">
          {SITE_CONFIG.name}
        </Link>
        <div className="flex items-center gap-2">
          <NavLinks />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
