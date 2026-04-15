'use client'

import { motion } from 'framer-motion'

export function BackgroundOrbs() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
      aria-hidden
    >
      {/* 左上：紫色主光晕 */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full bg-purple-600/25 blur-[130px]"
        animate={{ x: [0, 60, 20, 0], y: [0, 50, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 右上：粉色光晕 */}
      <motion.div
        className="absolute -top-[10%] -right-[15%] w-[550px] h-[550px] rounded-full bg-pink-500/20 blur-[120px]"
        animate={{ x: [0, -70, -30, 0], y: [0, 60, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 左下：蓝色冷光 */}
      <motion.div
        className="absolute bottom-[15%] -left-[5%] w-[420px] h-[420px] rounded-full bg-blue-500/15 blur-[110px]"
        animate={{ x: [0, 50, 0], y: [0, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 中右：橘色点缀（呼应橘子主题） */}
      <motion.div
        className="absolute top-[40%] right-[5%] w-[300px] h-[300px] rounded-full bg-orange-400/10 blur-[100px]"
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
