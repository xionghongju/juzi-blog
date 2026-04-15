'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

// 固定粒子参数，避免每次渲染随机导致闪烁
const PARTICLE_COLORS = ['#c084fc', '#f0abfc', '#818cf8', '#67e8f9', '#fdba74']
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${(i * 97 + 13) % 100}%`,
  size: 1 + (i % 4) * 0.7,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  duration: 14 + (i * 1.1) % 16,
  delay: (i * 1.3) % 16,
  xDrift: ((i * 23) % 80) - 40,
}))

function DarkParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
      {/* 底部深色光晕打底，增加层次感 */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-900/25 blur-[160px]" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-900/25 blur-[160px]" />

      {/* 上浮粒子 */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-[-6px] rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 5}px ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [0, -1400],
            x: [0, p.xDrift],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            opacity: {
              duration: p.duration,
              times: [0, 0.08, 0.85, 1],
              ease: 'linear',
            },
          }}
        />
      ))}
    </div>
  )
}

function LightOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
      {/* 左上：紫色主光晕 */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full bg-purple-400/20 blur-[130px]"
        animate={{ x: [0, 60, 20, 0], y: [0, 50, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 右上：粉色光晕 */}
      <motion.div
        className="absolute -top-[10%] -right-[15%] w-[550px] h-[550px] rounded-full bg-pink-400/15 blur-[120px]"
        animate={{ x: [0, -70, -30, 0], y: [0, 60, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 左下：蓝色冷光 */}
      <motion.div
        className="absolute bottom-[15%] -left-[5%] w-[420px] h-[420px] rounded-full bg-blue-400/12 blur-[110px]"
        animate={{ x: [0, 50, 0], y: [0, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 中右：橘色点缀 */}
      <motion.div
        className="absolute top-[40%] right-[5%] w-[300px] h-[300px] rounded-full bg-orange-400/12 blur-[100px]"
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export function BackgroundOrbs() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return resolvedTheme === 'dark' ? <DarkParticles /> : <LightOrbs />
}
