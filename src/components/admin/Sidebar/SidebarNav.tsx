'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FileText, Image, MessageSquare,
  Settings, LogOut, Smile, Bot, FolderOpen, Tag
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: '数据概览', icon: LayoutDashboard },
  { href: '/dashboard/posts', label: '文章管理', icon: FileText },
  { href: '/dashboard/categories', label: '分类管理', icon: FolderOpen },
  { href: '/dashboard/tags', label: '标签管理', icon: Tag },
  { href: '/dashboard/moments', label: '动态管理', icon: Smile },
  { href: '/dashboard/comments', label: '评论管理', icon: MessageSquare },
  { href: '/dashboard/media', label: '素材库', icon: Image },
  { href: '/dashboard/ai', label: 'AI 管理', icon: Bot },
  { href: '/dashboard/settings', label: '网站设置', icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { signOut } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    toast.success('已退出登录')
    router.push('/login')
  }

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      <div className="p-3 border-t border-border/50">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </nav>
  )
}
