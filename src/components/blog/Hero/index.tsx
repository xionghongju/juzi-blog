'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TypewriterText } from './TypewriterText'
import { FileText, Zap, CalendarDays } from 'lucide-react'

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

const SPARKLES = ['✦', '✧', '⋆', '✦', '✧']

export function Hero({ postCount = 0, momentCount = 0, startDate = '2024-01-01' }: HeroProps) {
  const daysRunning = getDaysRunning(startDate)

  const stats = [
    { icon: FileText, label: '篇文章', value: postCount },
    { icon: Zap, label: '条动态', value: momentCount },
    { icon: CalendarDays, label: '天坚持', value: daysRunning },
  ]

  return (
    <section className="py-16 text-center relative overflow-hidden">
      {/* 装饰性浮动粒子 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-primary/30 select-none"
            style={{
              left: `${15 + i * 16}%`,
              top: `${20 + (i % 3) * 20}%`,
              fontSize: `${10 + (i % 3) * 4}px`,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.3, 0.7, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          >
            {s}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl mb-6 cursor-pointer select-none inline-block"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 6, -6, 6, 0],
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.25, rotate: 20, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.85, rotate: -15, transition: { duration: 0.1 } }}
        >
          🍊
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          嗨，我是{' '}
          <span className="text-gradient">橘子</span>
        </motion.h1>

        <motion.div
          className="text-lg text-muted-foreground mb-6 h-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TypewriterText
            texts={['全栈开发者', '生活记录者', '技术探索者', '终身学习者']}
          />
        </motion.div>

        <motion.p
          className="max-w-xl mx-auto text-muted-foreground leading-relaxed mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          这里是我的个人空间，记录技术思考、生活点滴和一切有趣的事。
          欢迎你的到来 ✨
        </motion.p>

        {/* 统计数字 */}
        <motion.div
          className="flex items-center justify-center gap-8 md:gap-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              className="flex flex-col items-center gap-1 group cursor-default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}
              >
                <Icon className="h-4 w-4 text-muted-foreground mb-0.5" />
              </motion.div>
              <span className="text-2xl font-bold text-gradient">
                <CountUp value={value} delay={600 + i * 120} />
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
