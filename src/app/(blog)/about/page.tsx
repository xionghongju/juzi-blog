import { GitBranch, X, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '关于我' }

const skills = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Supabase', 'Tailwind CSS']

export default async function AboutPage() {
  const { data: settings } = await supabase.from('site_settings').select('*').single()

  return (
    <div className="max-w-2xl mx-auto">
      {/* 头像 & 简介 */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 mx-auto mb-4 flex items-center justify-center text-4xl">
          🍊
        </div>
        <h1 className="text-3xl font-bold mb-2">橘子</h1>
        <p className="text-muted-foreground">
          {settings?.description || '全栈开发者 / 生活记录者'}
        </p>
      </div>

      {/* 关于 */}
      <section className="mb-10 p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-4">关于我</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>你好！我是橘子，一名热爱技术和生活的开发者。</p>
          <p>这个博客是我的个人空间，用来记录技术思考、分享生活点滴，以及一切让我觉得有趣的事情。</p>
          <p>如果你对我的文章有什么想法，欢迎在评论区留言，或者通过下面的方式联系我 😊</p>
        </div>
      </section>

      {/* 技能 */}
      <section className="mb-10 p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-4">技术栈</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge key={s} variant="secondary" className="text-sm px-3 py-1">
              {s}
            </Badge>
          ))}
        </div>
      </section>

      {/* 联系方式 */}
      <section className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-4">联系我</h2>
        <div className="flex flex-col gap-3">
          {settings?.github_url && (
            <a href={settings.github_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <GitBranch className="h-5 w-5" />
              <span>GitHub</span>
            </a>
          )}
          {settings?.twitter_url && (
            <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
              <span>Twitter / X</span>
            </a>
          )}
          <a href="mailto:hello@example.com"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="h-5 w-5" />
            <span>发邮件给我</span>
          </a>
        </div>
      </section>
    </div>
  )
}
