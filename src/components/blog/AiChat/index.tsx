'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  text: string
  sources?: { title: string; slug: string }[]
}

type Action = 'idle' | 'wave' | 'dance' | 'jump' | 'think'

// ─── Constants ────────────────────────────────────────────────────────────────

const WELCOME: Message = {
  role: 'assistant',
  text: '嗨！我是橘子小助手🍊，可以帮你检索博客文章、回答技术问题。有什么想聊的？',
}

const BUBBLES = [
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

function pickAction(): Action {
  const r = Math.random()
  if (r < 0.42) return 'idle'
  if (r < 0.62) return 'wave'
  if (r < 0.77) return 'dance'
  if (r < 0.90) return 'jump'
  return 'think'
}

// ─── Outfits ──────────────────────────────────────────────────────────────────

interface OutfitDef {
  name: string
  emoji: string
  bodyColor: string
  render: () => React.ReactNode
}

const OUTFITS: OutfitDef[] = [
  {
    name: '素颜出镜',
    emoji: '🤖',
    bodyColor: 'url(#ai-rg-dark)',
    render: () => null,
  },
  {
    name: '西装革履',
    emoji: '👔',
    bodyColor: '#1e293b',
    render: () => (
      <g>
        <polygon points="19,55 35,66 19,83" fill="#334155" />
        <polygon points="51,55 35,66 51,83" fill="#334155" />
        <polygon points="28,55 35,63 42,55" fill="white" />
        <polygon points="32,60 35,74 38,60 35,56" fill="#dc2626" />
        <polygon points="33,74 35,80 37,74 35,76" fill="#b91c1c" />
        <circle cx="35" cy="68" r="1.8" fill="#475569" />
        <circle cx="35" cy="74" r="1.8" fill="#475569" />
        <rect x="20" y="58" width="7" height="5" rx="1" fill="white" opacity="0.8" />
      </g>
    ),
  },
  {
    name: '大厨当家',
    emoji: '👨‍🍳',
    bodyColor: '#fef3c7',
    render: () => (
      <g>
        <ellipse cx="35" cy="10" rx="18" ry="9" fill="#fffbeb" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        <rect x="17" y="7" width="36" height="6" rx="2" fill="#fef3c7" />
        <rect x="15" y="12" width="40" height="5" rx="2" fill="#fde68a" />
        <path d="M24 10 Q35 4 46 10" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
        <rect x="18" y="55" width="34" height="26" rx="7" fill="#fffbeb" stroke="rgba(0,0,0,0.12)" strokeWidth="1" opacity="0.97" />
        <rect x="30" y="55" width="10" height="26" fill="#fef9c3" opacity="0.5" />
        <rect x="22" y="68" width="11" height="8" rx="2" fill="#fde68a" />
        <path d="M26,55 Q35,51 44,55" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="18" y1="58" x2="7" y2="54" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="52" y1="58" x2="63" y2="54" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="42" cy="60" r="2" fill="#f59e0b" />
        <circle cx="42" cy="66" r="2" fill="#f59e0b" />
      </g>
    ),
  },
  {
    name: '宇宙飞行员',
    emoji: '🚀',
    bodyColor: '#94a3b8',
    render: () => (
      <g>
        <path d="M13,26 Q35,20 57,26 L55,44 Q35,50 15,44 Z" fill="rgba(56,189,248,0.38)" stroke="#0ea5e9" strokeWidth="2"/>
        <path d="M16,28 Q35,22 54,28" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"/>
        <path d="M8,32 Q8,56 35,56 Q62,56 62,32" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
        <rect x="17" y="57" width="14" height="9" rx="2" fill="#1d4ed8" />
        <circle cx="24" cy="61" r="3" fill="#f97316" opacity="0.8"/>
        <path d="M21 61 L27 61" stroke="white" strokeWidth="1" />
        <circle cx="49" cy="58" r="6" fill="#0f172a" />
        <circle cx="49" cy="58" r="4" fill="#22c55e" opacity="0.85" />
        <path d="M46 58 L52 58 M49 55 L49 61" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <rect x="20" y="70" width="30" height="7" rx="3" fill="#334155" />
        <circle cx="28" cy="73" r="2" fill="#f87171" opacity="0.8"/>
        <circle cx="35" cy="73" r="2" fill="#fbbf24" opacity="0.8"/>
        <circle cx="42" cy="73" r="2" fill="#4ade80" opacity="0.8"/>
      </g>
    ),
  },
  {
    name: '足球少年',
    emoji: '⚽',
    bodyColor: '#dc2626',
    render: () => (
      <g>
        <rect x="18" y="55" width="34" height="7" fill="white" opacity="0.25" />
        <rect x="18" y="69" width="34" height="7" fill="white" opacity="0.25" />
        <text x="35" y="69" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial Black, sans-serif" opacity="0.9">9</text>
        <path d="M27,55 Q35,61 43,55" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="1" y="57" width="12" height="5" rx="2" fill="white" opacity="0.45" />
        <rect x="57" y="57" width="12" height="5" rx="2" fill="white" opacity="0.45" />
        <rect x="1" y="62" width="12" height="4" rx="1" fill="#fbbf24" opacity="0.8" />
        <text x="35" y="79" textAnchor="middle" fill="white" fontSize="5" fontFamily="Arial, sans-serif" opacity="0.7">JUZI</text>
      </g>
    ),
  },
  {
    name: '超级英雄',
    emoji: '🦸',
    bodyColor: '#7c3aed',
    render: () => (
      <g>
        <path d="M19,55 L7,84 Q35,72 63,84 L51,55 Q35,63 19,55Z" fill="#dc2626" opacity="0.92"/>
        <path d="M19,55 Q35,60 51,55" stroke="#b91c1c" strokeWidth="1.5" fill="none"/>
        <polygon points="35,56 37.5,63 45,63 39,67.5 41.5,74.5 35,70 28.5,74.5 31,67.5 25,63 32.5,63" fill="#fbbf24" />
        <rect x="11" y="28" width="12" height="7" rx="3.5" fill="#1a1a2e" />
        <rect x="47" y="28" width="12" height="7" rx="3.5" fill="#1a1a2e" />
        <rect x="23" y="31" width="24" height="3" rx="1.5" fill="#1a1a2e" />
        <rect x="17" y="75" width="36" height="6" rx="3" fill="#92400e" />
        <rect x="31" y="74" width="8" height="8" rx="2" fill="#fbbf24" />
        <text x="35" y="80" textAnchor="middle" fill="#92400e" fontSize="5" fontWeight="bold">⚡</text>
      </g>
    ),
  },
  {
    name: '橘子农夫',
    emoji: '🌾',
    bodyColor: '#92400e',
    render: () => (
      <g>
        <ellipse cx="35" cy="14" rx="30" ry="7" fill="#d97706" />
        <ellipse cx="35" cy="11" rx="19" ry="10" fill="#b45309" />
        <rect x="16" y="12" width="38" height="4" rx="1" fill="#f59e0b" />
        <path d="M22 10 Q35 5 48 10" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <rect x="22" y="50" width="6" height="30" rx="3" fill="#1d4ed8" />
        <rect x="42" y="50" width="6" height="30" rx="3" fill="#1d4ed8" />
        <rect x="20" y="55" width="30" height="20" rx="5" fill="#2563eb" />
        <rect x="28" y="59" width="14" height="10" rx="3" fill="#1d4ed8" />
        <circle cx="35" cy="64" r="4.5" fill="#f97316" />
        <path d="M35,59.5 Q37,57 36,55" stroke="#16a34a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="71" r="2" fill="#92400e" opacity="0.4"/>
        <circle cx="46" cy="68" r="1.5" fill="#92400e" opacity="0.3"/>
      </g>
    ),
  },
]

// ─── Speech Bubble ────────────────────────────────────────────────────────────

const SpeechBubble = memo(function SpeechBubble({ text }: { text: string }) {
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

// ─── Outfit Badge ─────────────────────────────────────────────────────────────

const OutfitBadge = memo(function OutfitBadge({ outfit }: { outfit: OutfitDef }) {
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

// ─── Robot animation configs (module-level constants, never recreated) ─────────

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

// ─── Robot SVG ────────────────────────────────────────────────────────────────

const RobotCharacter = memo(function RobotCharacter({ action, outfit }: { action: Action; outfit: OutfitDef }) {
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
    <motion.svg
      viewBox="0 0 70 98"
      width="56"
      height="78"
      style={SVG_STYLE}
      animate={BODY_ANIMS[action]}
    >
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

      {/* Ground shadow */}
      <ellipse cx="35" cy="97" rx="18" ry="3" fill="rgba(139,92,246,0.18)" />

      {/* Antenna */}
      <motion.g
        animate={{ rotate: [-6, 6, -6] }}
        style={{ transformOrigin: '35px 14px' }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <line x1="35" y1="5" x2="35" y2="14" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
        <motion.circle cx="35" cy="4" r="5" fill="url(#ai-rg-body)"
          animate={{ scale: [1, 1.4, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <circle cx="35" cy="3" r="2" fill="white" opacity="0.55" />
      </motion.g>

      {/* Head */}
      <rect x="8" y="13" width="54" height="40" rx="19" fill="url(#ai-rg-head)" />
      {/* Sheen */}
      <ellipse cx="24" cy="19" rx="11" ry="4" fill="white" opacity="0.18" transform="rotate(-15 24 19)" />
      {/* Face screen */}
      <rect x="12" y="17" width="46" height="32" rx="13" fill="rgba(15,10,40,0.22)" />

      {/* Left eye */}
      <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ scaleY: eyeOpen ? 1 : 0.05 }}
        transition={{ duration: 0.08 }}
      >
        <rect x="14" y="22" width="17" height="14" rx="7" fill="white" />
        <circle cx="22.5" cy="28.5" r="5.5" fill="#1e1b4b" />
        <circle cx="26" cy="24.5" r="2.2" fill="white" />
        <circle cx="19" cy="31.5" r="1.1" fill="white" opacity="0.65" />
      </motion.g>

      {/* Right eye (symmetric) */}
      <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ scaleY: eyeOpen ? 1 : 0.05 }}
        transition={{ duration: 0.08 }}
      >
        <rect x="39" y="22" width="17" height="14" rx="7" fill="white" />
        <circle cx="47.5" cy="28.5" r="5.5" fill="#1e1b4b" />
        <circle cx="51" cy="24.5" r="2.2" fill="white" />
        <circle cx="44" cy="31.5" r="1.1" fill="white" opacity="0.65" />
      </motion.g>

      {/* Cheeks */}
      <ellipse cx="15" cy="40" rx="6" ry="3.5" fill="#fda4af" opacity="0.5" />
      <ellipse cx="55" cy="40" rx="6" ry="3.5" fill="#fda4af" opacity="0.5" />

      {/* Mouth */}
      <AnimatePresence mode="wait">
        {action === 'think' ? (
          <motion.path key="m-think" d="M27 45 Q35 45 43 45"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"
            initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }}
          />
        ) : action === 'dance' || action === 'jump' ? (
          <motion.path key="m-big" d="M24 43 Q35 53 46 43"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"
            initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }}
          />
        ) : (
          <motion.path key="m-smile" d="M26 44 Q35 51 44 44"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"
            initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Body */}
      <rect x="16" y="55" width="38" height="28" rx="13" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />

      {/* Outfit layer */}
      <AnimatePresence mode="wait">
        <motion.g key={outfit.name}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {outfit.render()}
        </motion.g>
      </AnimatePresence>

      {/* Chest orb – only for default outfit */}
      {outfit.bodyColor === 'url(#ai-rg-dark)' && (
        <>
          <motion.circle cx="35" cy="68" r="5.5" fill="#f472b6"
            animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.7, repeat: Infinity }}
          />
          <motion.circle cx="25" cy="63" r="2.5" fill="rgba(255,255,255,0.55)"
            animate={{ opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.circle cx="45" cy="63" r="2.5" fill="rgba(255,255,255,0.55)"
            animate={{ opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      {/* Left arm */}
      <motion.rect x="1" y="57" width="13" height="18" rx="6.5" fill={outfit.bodyColor}
        stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"
        animate={LEFT_ARM_ANIMS[action]}
        style={{ transformBox: 'fill-box', transformOrigin: 'top center' }}
      />

      {/* Right arm */}
      <motion.rect x="56" y="57" width="13" height="18" rx="6.5" fill={outfit.bodyColor}
        stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"
        animate={RIGHT_ARM_ANIMS[action]}
        style={{ transformBox: 'fill-box', transformOrigin: 'top center' }}
      />

      {/* Legs */}
      <rect x="19" y="80" width="13" height="12" rx="6" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <rect x="38" y="80" width="13" height="12" rx="6" fill={outfit.bodyColor} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      {/* Feet */}
      <ellipse cx="25.5" cy="92" rx="8" ry="3.5" fill={outfit.bodyColor} opacity="0.85" />
      <ellipse cx="44.5" cy="92" rx="8" ry="3.5" fill={outfit.bodyColor} opacity="0.85" />
    </motion.svg>
  )
})

// ─── Main Component ───────────────────────────────────────────────────────────

export function AiChat() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [action, setAction]     = useState<Action>('idle')
  const [bubble, setBubble]     = useState<string | null>(null)
  const [outfitIdx, setOutfitIdx]         = useState(0)
  const [showOutfitBadge, setShowOutfitBadge] = useState(false)

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const bubbleIdx  = useRef(0)

  const currentOutfit = OUTFITS[outfitIdx]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  // Cycle actions
  useEffect(() => {
    if (open) return
    setAction('idle')
    let t: ReturnType<typeof setTimeout>
    const cycle = () => {
      setAction(pickAction())
      t = setTimeout(cycle, 3500 + Math.random() * 3500)
    }
    t = setTimeout(cycle, 3000)
    return () => clearTimeout(t)
  }, [open])

  // Speech bubbles
  useEffect(() => {
    if (open) { setBubble(null); return }
    const show = () => {
      const text = BUBBLES[bubbleIdx.current % BUBBLES.length]
      bubbleIdx.current++
      setBubble(text)
      setTimeout(() => setBubble(null), 3200)
    }
    const t0 = setTimeout(show, 1800)
    const iv = setInterval(show, 7500)
    return () => { clearTimeout(t0); clearInterval(iv) }
  }, [open])

  // Change outfit every 30s
  useEffect(() => {
    const iv = setInterval(() => {
      setOutfitIdx(i => (i + 1) % OUTFITS.length)
      setBubble(null)
      setShowOutfitBadge(true)
      setTimeout(() => setShowOutfitBadge(false), 2500)
    }, 30000)
    return () => clearInterval(iv)
  }, [])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    const history = messages.slice(1).map(m => ({ role: m.role, text: m.text }))
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', text: err.error || '出错了，请稍后再试' }])
        return
      }
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let full = ''
      const assistantMsg: Message = { role: 'assistant', text: '' }
      setMessages(prev => [...prev, assistantMsg])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value, { stream: true })
        const displayText = full.replace(/\n\n@@SOURCES@@.*$/, '')
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { ...assistantMsg, text: displayText }
          return next
        })
      }
      const sourceMatch = full.match(/@@SOURCES@@(.+)$/)
      const sources = sourceMatch ? JSON.parse(sourceMatch[1]) : []
      const finalText = full.replace(/\n\n@@SOURCES@@.*$/, '')
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', text: finalText, sources }
        return next
      })
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '网络出错，请稍后重试 😅' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  return (
    <>
      {/* ── Robot / Close button ── */}
      <div className="fixed bottom-5 right-6 z-50 flex flex-col items-center">
        <AnimatePresence>
          {!open && showOutfitBadge && <OutfitBadge key={`badge-${outfitIdx}`} outfit={currentOutfit} />}
          {!open && !showOutfitBadge && bubble && <SpeechBubble key={bubble} text={bubble} />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {open ? (
            <motion.button
              key="close"
              initial={{ scale: 0, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setOpen(false)}
              aria-label="关闭"
              className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white"
            >
              <X className="h-6 w-6" />
            </motion.button>
          ) : (
            <motion.button
              key="robot"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setOpen(true)}
              aria-label="AI 助手"
              className="cursor-pointer select-none"
            >
              <RobotCharacter action={action} outfit={currentOutfit} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🍊</div>
              <div>
                <p className="text-sm font-semibold">橘子小助手</p>
                <p className="text-xs text-muted-foreground">基于博客文章 · Gemini 驱动</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      {msg.text}
                      {msg.role === 'assistant' && !msg.text && (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map(s => (
                          <Link key={s.slug} href={`/posts/${s.slug}`} target="_blank"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="px-3 py-3 border-t border-border/50">
              <form onSubmit={e => { e.preventDefault(); send() }}
                className="flex gap-2 items-center bg-muted rounded-xl px-3 py-2"
              >
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  placeholder="问我任何问题..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()}
                  className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
