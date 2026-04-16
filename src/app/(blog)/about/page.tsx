import { GitBranch, X, Mail, ExternalLink, MapPin, Coffee } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '关于我' }

const skillGroups = [
  {
    label: '前端',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    label: '后端',
    skills: ['Node.js', 'Supabase', 'PostgreSQL', 'REST API'],
  },
  {
    label: '工具',
    skills: ['Git', 'VS Code', 'Figma', 'Vercel', 'Docker'],
  },
  {
    label: '学习中',
    skills: ['Rust', 'Three.js', 'AI 应用开发'],
  },
]

const projects = [
  {
    name: '橘子博客',
    desc: '基于 Next.js 15 + Supabase 搭建的个人博客，支持 AI 助手、评论、动态等功能。',
    tags: ['Next.js', 'Supabase', 'TypeScript'],
    href: '/',
    emoji: '🍊',
  },
  {
    name: '橘子工具箱',
    desc: '收集日常开发中常用的在线小工具，包括 JSON 格式化、颜色转换、正则测试等。',
    tags: ['React', 'Vite', 'Tailwind'],
    href: '#',
    emoji: '🧰',
  },
  {
    name: '读书笔记',
    desc: '记录每一本读过的书，摘录精彩段落，写下个人感悟，慢慢积累的阅读仓库。',
    tags: ['生活', '读书', '笔记'],
    href: '#',
    emoji: '📚',
  },
]

const timeline = [
  { year: '2024', title: '开始写博客', desc: '搭建了这个个人博客，开始系统地记录技术和生活。' },
  { year: '2023', title: '转型全栈', desc: '从纯前端开始学习后端、数据库，完成了第一个全栈项目。' },
  { year: '2022', title: '入坑前端', desc: '接触 React、TypeScript，爱上了写 UI 的感觉。' },
  { year: '2021', title: '编程启蒙', desc: '大学期间开始学习编程，写下了人生第一行 Hello World。' },
]

const currently = [
  { emoji: '💻', label: '正在做', text: '用 Next.js 打磨这个博客的每一个细节' },
  { emoji: '📖', label: '正在读', text: '《深入理解计算机系统》' },
  { emoji: '🎵', label: '最近在听', text: '后摇 / Lo-Fi / 轻音乐' },
  { emoji: '🌍', label: '想去的地方', text: '日本 / 冰岛 / 云南' },
]

export default async function AboutPage() {
  const { data: settings } = await supabase.from('site_settings').select('*').single()

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* 头部：头像 + 简介 */}
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20">
          🍊
        </div>
        <h1 className="text-3xl font-bold mb-1">橘子</h1>
        <p className="text-muted-foreground mb-3">
          {settings?.description || '全栈开发者 / 生活记录者'}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>中国 · 远程</span>
          <span className="mx-1">·</span>
          <Coffee className="h-3.5 w-3.5" />
          <span>咖啡驱动开发</span>
        </div>
      </div>

      {/* 关于我 */}
      <section className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-4">关于我</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
          <p>
            你好！我是橘子，一名热爱技术与生活的全栈开发者。喜欢把复杂的问题拆解成简单的模块，也喜欢把生活里零碎的感悟写成文字留存下来。
          </p>
          <p>
            工作之外，我热衷于捣鼓各种开源工具、折腾个人项目。相信"做中学"是最高效的成长方式，每一个 side project 都是一次探索。
          </p>
          <p>
            这个博客是我的数字花园，没有固定的主题，有技术笔记、读书感悟、生活记录，以及一切让我觉得值得分享的东西。如果你读到了共鸣，欢迎留言聊聊 😊
          </p>
        </div>
      </section>

      {/* 近期 */}
      <section className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-4">近期</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currently.map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
              <span className="text-xl shrink-0">{item.emoji}</span>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-sm font-medium">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 技术栈 */}
      <section className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-5">技术栈</h2>
        <div className="space-y-4">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((s) => (
                  <Badge
                    key={s}
                    variant={group.label === '学习中' ? 'outline' : 'secondary'}
                    className="text-sm px-3 py-1"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 项目 */}
      <section className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-5">项目</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.href}
              className="flex items-start gap-4 p-4 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-all group"
            >
              <span className="text-2xl shrink-0">{project.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm group-hover:text-primary transition-colors">{project.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{project.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 成长轨迹 */}
      <section className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-5">成长轨迹</h2>
        <div className="relative pl-4 space-y-6">
          <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
          {timeline.map((item) => (
            <div key={item.year} className="relative pl-5">
              <div className="absolute -left-[1px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary/70 border-2 border-background" />
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono text-primary font-semibold">{item.year}</span>
                <span className="text-sm font-semibold">{item.title}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 联系方式 */}
      <section className="p-6 rounded-2xl border border-border/50 bg-card">
        <h2 className="text-xl font-bold mb-4">联系我</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          如果你有任何问题、合作想法，或者只是想聊聊天，都欢迎联系我！
        </p>
        <div className="flex flex-col gap-3">
          {settings?.github_url && (
            <a
              href={settings.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-xs text-muted-foreground">{settings.github_url}</p>
              </div>
            </a>
          )}
          {settings?.twitter_url && (
            <a
              href={settings.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
                <X className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Twitter / X</p>
                <p className="text-xs text-muted-foreground">{settings.twitter_url}</p>
              </div>
            </a>
          )}
          <a
            href={`mailto:${settings?.email || 'hello@example.com'}`}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">邮件</p>
              <p className="text-xs text-muted-foreground">{settings?.email || 'hello@example.com'}</p>
            </div>
          </a>
        </div>
      </section>

    </div>
  )
}
