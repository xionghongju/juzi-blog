'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-block">
      <h2 className="text-2xl font-bold">{children}</h2>
      <motion.div
        className="absolute -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-primary via-purple-400 to-pink-400"
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: '100%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
      />
    </div>
  )
}
