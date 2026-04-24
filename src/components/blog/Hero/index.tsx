'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TypewriterText } from './TypewriterText'
import { FileText, Zap, CalendarDays, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface HeroProps {
  postCount?: number
  momentCount?: number
  startDate?: string
}

function getDaysRunning(startDate: string) {
  const start = new Date(startDate)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function CountUp({ value, delay = 0 }: { value: number; delay?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const timeout = setTimeout(() => {
      if (value === 0) return
      let current = 0
      const increment = Math.max(1, Math.ceil(value / 50))
      const timer = setInterval(() => {
        current = Math.min(current + increment, value)
        setCount(current)
        if (current >= value) clearInterval(timer)
      }, 20)
      return () => clearInterval(timer)
    }, delay)
    return () => clearTimeout(timeout)
  }, [isInView, value, delay])

  return <span ref={ref}>{count}</span>
}

const TECH_STACK = [
  { label: 'Next.js', color: 'bg-black/10 dark:bg-white/10 text-foreground' },
  { label: 'React', color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' },
  { label: 'TypeScript', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  { label: 'Tailwind', color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' },
  { label: 'Supabase', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  { label: 'Node.js', color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  { label: 'PostgreSQL', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' },
  { label: 'AI / LLM', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
]

export function Hero({ postCount = 0, momentCount = 0, startDate = '2024-01-01' }: HeroProps) {
  const daysRunning = getDaysRunning(startDate)

  const stats = [
    { icon: FileText, label: '篇文章', value: postCount, href: '/posts' },
    { icon: Zap, label: '条动态', value: momentCount, href: '/moments' },
    { icon: CalendarDays, label: '天坚持', value: daysRunning, href: '/about' },
  ]

  return (
    <section className="pt-10 pb-6 text-center relative">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* 头像/Logo */}
        <motion.div
          className="text-6xl mb-5 cursor-pointer select-none inline-block"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.25, rotate: 20, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.85, rotate: -15, transition: { duration: 0.1 } }}
        >
          🍊
        </motion.div>

        {/* 标题 */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          嗨，我是{' '}
          <span className="text-gradient">橘子</span>
        </motion.h1>

        {/* 打字机 */}
        <motion.div
          className="text-lg text-muted-foreground mb-4 h-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TypewriterText
            texts={['全栈开发者', '生活记录者', '技术探索者', '终身学习者']}
          />
        </motion.div>

        {/* 简介 */}
        <motion.p
          className="max-w-lg mx-auto text-muted-foreground leading-relaxed mb-7 text-sm md:text-base"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          这里是我的个人空间，记录技术思考、生活点滴和一切有趣的事。
          欢迎你的到来 ✨
        </motion.p>

        {/* CTA 按钮 */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8 flex-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-primary/25"
          >
            查看文章 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted/60 transition-colors"
          >
            关于我
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted/60 transition-colors text-muted-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
          </a>
        </motion.div>

        {/* 统计数字卡片 */}
        <motion.div
          className="flex items-center justify-center gap-4 md:gap-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          {stats.map(({ icon: Icon, label, value, href }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.06, transition: { duration: 0.15 } }}
            >
              <Link
                href={href}
                className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 backdrop-blur-sm shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-2xl font-bold text-gradient leading-none">
                  <CountUp value={value} delay={600 + i * 120} />
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* 技术栈 */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-xs text-muted-foreground mb-3 tracking-widest uppercase">Tech Stack</p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map((tech, i) => (
              <motion.span
                key={tech.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.75 + i * 0.05 }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${tech.color}`}
              >
                {tech.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
