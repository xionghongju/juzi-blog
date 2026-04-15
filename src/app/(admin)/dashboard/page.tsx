import { FileText, Smile, MessageSquare, Eye } from 'lucide-react'
import { StatCard } from '@/components/admin/Dashboard/StatCard'
import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '数据概览 - 后台管理' }

async function getStats() {
  const [
    { count: postCount },
    { count: momentCount },
    { count: commentCount },
    { data: viewData },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('moments').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('posts').select('view_count'),
  ])

  const totalViews = viewData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0

  return { postCount: postCount || 0, momentCount: momentCount || 0, commentCount: commentCount || 0, totalViews }
}

export default async function DashboardPage() {
  const { postCount, momentCount, commentCount, totalViews } = await getStats()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">数据概览</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="已发布文章" value={postCount} icon={FileText} color="text-blue-500" />
        <StatCard title="朋友圈动态" value={momentCount} icon={Smile} color="text-pink-500" />
        <StatCard title="待审核评论" value={commentCount} icon={MessageSquare} color="text-orange-500" />
        <StatCard title="累计阅读量" value={totalViews} icon={Eye} color="text-green-500" />
      </div>

      <div className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="font-semibold mb-4">快速入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/posts/new', label: '✍️ 写新文章' },
            { href: '/dashboard/moments', label: '📸 发动态' },
            { href: '/dashboard/comments', label: '💬 审核评论' },
            { href: '/dashboard/settings', label: '⚙️ 网站设置' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted text-sm font-medium text-center transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
