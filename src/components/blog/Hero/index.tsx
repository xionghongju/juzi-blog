'use client'

import { motion } from 'framer-motion'
import { TypewriterText } from './TypewriterText'
import { FileText, Zap, CalendarDays } from 'lucide-react'

interface HeroProps {
  postCount?: number
  momentCount?: number
  startDate?: string // ISO 日期字符串，用于计算运行天数
}

function getDaysRunning(startDate: string) {
  const start = new Date(startDate)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function Hero({ postCount = 0, momentCount = 0, startDate = '2024-01-01' }: HeroProps) {
  const daysRunning = getDaysRunning(startDate)

  const stats = [
    { icon: FileText, label: '篇文章', value: postCount },
    { icon: Zap, label: '条动态', value: momentCount },
    { icon: CalendarDays, label: '天坚持', value: daysRunning },
  ]

  return (
    <section className="py-16 text-center">
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

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          嗨，我是{' '}
          <span className="text-gradient">橘子</span>
        </h1>

        <div className="text-lg text-muted-foreground mb-6 h-7">
          <TypewriterText
            texts={['全栈开发者', '生活记录者', '技术探索者', '终身学习者']}
          />
        </div>

        <p className="max-w-xl mx-auto text-muted-foreground leading-relaxed mb-10">
          这里是我的个人空间，记录技术思考、生活点滴和一切有趣的事。
          欢迎你的到来 ✨
        </p>

        {/* 统计数字 */}
        <motion.div
          className="flex items-center justify-center gap-8 md:gap-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {stats.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            >
              <Icon className="h-4 w-4 text-muted-foreground mb-0.5" />
              <span className="text-2xl font-bold text-gradient">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
