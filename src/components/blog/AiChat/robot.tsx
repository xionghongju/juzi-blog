'use client'

import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type OutfitDef } from './outfits'

export interface Message {
  role: 'user' | 'assistant'
  text: string
  sources?: { title: string; slug: string }[]
}

export type Action = 'idle' | 'wave' | 'dance' | 'jump' | 'think'

export const WELCOME: Message = {
  role: 'assistant',
  text: '嗨！我是橘子小助手🍊，可以帮你检索博客文章、回答技术问题。有什么想聊的？',
}

export const BUBBLES = [
  '嗨！有什么想聊的？ 💬',
  '来问我技术问题吧 🤖',
  '博客里的一切我都懂！',
  '点我来聊聊吧 👋',
  '有技术疑问找我哦 🧠',
  '我是橘子小助手 🍊',
  '无聊了？来聊天！ ✨',
  '试试问我任何问题？',
  '你好呀，需要帮忙吗 🎉',
  '快来问我吧，我在这里！',
]

export function pickAction(): Action {
  const r = Math.random()
  if (r < 0.42) return 'idle'
  if (r < 0.62) return 'wave'
  if (r < 0.77) return 'dance'
  if (r < 0.90) return 'jump'
  return 'think'
}

const BODY_ANIMS: Record<Action, object> = {
  idle:  { y: [0, -7, 0],           transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  wave:  { y: [0, -5, 0],           transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  dance: { rotate: [-9, 9, -9], y: [0, -5, 0], transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } },
  jump:  { y: [0, -22, 0, -11, 0],  transition: { duration: 0.75, times: [0, 0.35, 0.55, 0.75, 1], repeat: Infinity, repeatDelay: 1.0, ease: 'easeOut' } },
  think: { rotate: [-3, 3, -3], y: [0, -2, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
}

const RIGHT_ARM_ANIMS: Record<Action, object> = {
  idle:  { rotate: 0,               transition: { duration: 0.5 } },
  wave:  { rotate: [-45, 20, -45],  transition: { duration: 0.4, repeat: Infinity } },
  dance: { rotate: [25, -25, 25],   transition: { duration: 0.28, repeat: Infinity } },
  jump:  { rotate: [-55, 55, -55],  transition: { duration: 0.38, repeat: Infinity } },
  think: { rotate: -62,             transition: { duration: 0.6, ease: 'easeOut' } },
}

const LEFT_ARM_ANIMS: Record<Action, object> = {
  idle:  { rotate: 0,               transition: { duration: 0.5 } },
  wave:  { rotate: 12,              transition: { duration: 0.5 } },
  dance: { rotate: [-25, 25, -25],  transition: { duration: 0.28, repeat: Infinity, delay: 0.14 } },
  jump:  { rotate: [55, -55, 55],   transition: { duration: 0.38, repeat: Infinity } },
  think: { rotate: 0,               transition: { duration: 0.5 } },
}

const SVG_STYLE = {
  overflow: 'visible' as const,
  filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.35)) drop-shadow(0 0 6px rgba(255,255,255,0.4)) drop-shadow(0 6px 16px rgba(168,85,247,0.45))',
}

export const SpeechBubble = memo(function SpeechBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute bottom-[calc(100%+10px)] right-1/2 translate-x-1/2 z-10 w-[160px]"
    >
      <div className="relative bg-white dark:bg-zinc-800 border border-border/60 text-foreground text-xs font-medium px-3 py-2 rounded-2xl shadow-lg text-center leading-snug">
        {text}
      </div>
      <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-white dark:border-t-zinc-800" />
    </motion.div>
  )
})

export const OutfitBadge = memo(function OutfitBadge({ outfit }: { outfit: OutfitDef }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.85 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-[calc(100%+10px)] right-1/2 translate-x-1/2 z-10 whitespace-nowrap"
    >
      <div className="bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm">
        {outfit.emoji} {outfit.name}
      </div>
    </motion.div>
  )
})

export const RobotCharacter = memo(function RobotCharacter({ action, outfit }: { action: Action; outfit: OutfitDef }) {
  const [eyeOpen, setEyeOpen] = useState(true)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const blink = () => {
      setEyeOpen(false)
      t = setTimeout(() => {
        setEyeOpen(true)
        if (Math.random() > 0.55) {
          t = setTimeout(() => {
            setEyeOpen(false)
            t = setTimeout(() => { setEyeOpen(true); schedule() }, 110)
          }, 220)
        } else {
          schedule()
        }
      }, 110)
    }
    const schedule = () => { t = setTimeout(blink, 2200 + Math.random() * 2800) }
    schedule()
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.svg viewBox="0 0 70 98" width="56" height="78" style={SVG_STYLE} animate={BODY_ANIMS[action]}>
      <defs>
        <linearGradient id="ai-rg-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="ai-rg-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="ai-rg-head" x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
      </defs>

      <ellipse cx="35" cy="97" rx="18" ry="3" fill="rgba(139,92,246,0.18)" />

      <motion.g animate={{ rotate: [-6, 6, -6] }} style={{ transformOrigin: '35px 14px' }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <line x1="35" y1="5" x2="35" y2="14" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
        <motion.circle cx="35" cy="4" r="5" fill="url(#ai-rg-body)" animate={{ scale: [1, 1.4, 1], opacity: [0.85, 1, 0.85] }} transition={{ duration: 1.2, repeat: Infinity }} />
        <circle cx="35" cy="3" r="2" fill="white" opacity="0.55" />
      </motion.g>

      <rect x="8" y="13" width="54" height="40" rx="19" fill="url(#ai-rg-head)" />
      <ellipse cx="24" cy="19" rx="11" ry="4" fill="white" opacity="0.18" transform="rotate(-15 24 19)" />
      <rect x="12" y="17" width="46" height="32" rx="13" fill="rgba(15,10,40,0.22)" />

      <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} animate={{ scaleY: eyeOpen ? 1 : 0.05 }} transition={{ duration: 0.08 }}>
        <rect x="14" y="22" width="17" height="14" rx="7" fill="white" />
        <circle cx="22.5" cy="28.5" r="5.5" fill="#1e1b4b" />
        <circle cx="26" cy="24.5" r="2.2" fill="white" />
        <circle cx="19" cy="31.5" r="1.1" fill="white" opacity="0.65" />
      </motion.g>

      <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} animate={{ scaleY: eyeOpen ? 1 : 0.05 }} transition={{ duration: 0.08 }}>
        <rect x="39" y="22" width="17" height="14" rx="7" fill="white" />
        <circle cx="47.5" cy="28.5" r="5.5" fill="#1e1b4b" />
        <circle cx="51" cy="24.5" r="2.2" fill="white" />
        <circle cx="44" cy="31.5" r="1.1" fill="white" opacity="0.65" />
      </motion.g>

      <ellipse cx="15" cy="40" rx="6" ry="3.5" fill="#fda4af" opacity="0.5" />
      <ellipse cx="55" cy="40" rx="6" ry="3.5" fill="#fda4af" opacity="0.5" />

      <AnimatePresence mode="wait">
        {action === 'think' ? (
          <motion.path key="m-think" d="M27 45 Q35 45 43 45" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }} />
        ) : action === 'dance' || action === 'jump' ? (
          <motion.path key="m-big" d="M24 43 Q35 53 46 43" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }} />
        ) : (
          <motion.path key="m-smile" d="M26 44 Q35 51 44 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>

      <rect x="16" y="55" width="38" height="28" rx="13" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />

      <AnimatePresence mode="wait">
        <motion.g key={outfit.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          {outfit.render()}
        </motion.g>
      </AnimatePresence>

      {outfit.bodyColor === 'url(#ai-rg-dark)' && (
        <>
          <motion.circle cx="35" cy="68" r="5.5" fill="#f472b6" animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.7, repeat: Infinity }} />
          <motion.circle cx="25" cy="63" r="2.5" fill="rgba(255,255,255,0.55)" animate={{ opacity: [0.25, 0.8, 0.25] }} transition={{ duration: 1.1, repeat: Infinity, delay: 0.2 }} />
          <motion.circle cx="45" cy="63" r="2.5" fill="rgba(255,255,255,0.55)" animate={{ opacity: [0.25, 0.8, 0.25] }} transition={{ duration: 1.1, repeat: Infinity, delay: 0.5 }} />
        </>
      )}

      <motion.rect x="1" y="57" width="13" height="18" rx="6.5" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" animate={LEFT_ARM_ANIMS[action]} style={{ transformBox: 'fill-box', transformOrigin: 'top center' }} />
      <motion.rect x="56" y="57" width="13" height="18" rx="6.5" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" animate={RIGHT_ARM_ANIMS[action]} style={{ transformBox: 'fill-box', transformOrigin: 'top center' }} />

      <rect x="19" y="80" width="13" height="12" rx="6" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <rect x="38" y="80" width="13" height="12" rx="6" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <ellipse cx="25.5" cy="92" rx="8" ry="3.5" fill={outfit.bodyColor} opacity="0.85" />
      <ellipse cx="44.5" cy="92" rx="8" ry="3.5" fill={outfit.bodyColor} opacity="0.85" />
    </motion.svg>
  )
})
