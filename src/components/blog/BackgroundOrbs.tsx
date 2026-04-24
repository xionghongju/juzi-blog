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
      {/* 顶部放射渐变底色，统一基调 */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(168,85,247,0.18) 0%, transparent 70%)',
      }} />

      {/* 左上：紫色主光晕 */}
      <div
        className="absolute -top-[15%] -left-[8%] w-[700px] h-[700px] rounded-full bg-purple-400/35 blur-[130px]"
        style={{ animation: 'slowDrift1 18s ease-in-out infinite' }}
      />
      {/* 右上：品红光晕 */}
      <div
        className="absolute -top-[10%] -right-[12%] w-[580px] h-[520px] rounded-full bg-fuchsia-400/22 blur-[120px]"
        style={{ animation: 'slowDrift2 22s ease-in-out infinite' }}
      />
      {/* 左下：蓝紫冷光 */}
      <div
        className="absolute bottom-[20%] -left-[5%] w-[460px] h-[460px] rounded-full bg-violet-300/20 blur-[120px]"
        style={{ animation: 'slowDrift3 26s ease-in-out infinite' }}
      />
      {/* 右中：玫瑰暖调 */}
      <div
        className="absolute top-[42%] right-[6%] w-[340px] h-[340px] rounded-full bg-rose-300/18 blur-[100px]"
        style={{ animation: 'slowDrift4 16s ease-in-out infinite' }}
      />

      <style>{`
        @keyframes slowDrift1 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(65px, 55px); }
          66% { transform: translate(25px, 20px); }
        }
        @keyframes slowDrift2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-70px, 65px); }
          66% { transform: translate(-30px, 30px); }
        }
        @keyframes slowDrift3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(55px, -65px); }
        }
        @keyframes slowDrift4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-45px, 55px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

export function BackgroundOrbs() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return resolvedTheme === 'dark' ? <DarkParticles /> : <LightOrbs />
}
