import Link from 'next/link'
import { SidebarNav } from './SidebarNav'
import { SITE_CONFIG } from '@/lib/constants'

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-border/50 bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="h-14 flex items-center px-5 border-b border-border/50">
        <Link href="/" target="_blank" className="font-bold text-gradient">
          {SITE_CONFIG.name}
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  )
}
