'use client'

import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const POPUPS = ['💕', '⭐', '✨', '🎉', '💖', '🍊']

const REACTIONS = [
  { y: [0, -50, -10, 0] },
  { y: [0, -30, 0], rotate: [0, -18, 18, -8, 0] },
  { y: [0, -40, 0], rotate: [0, 360] },
  { y: [0, -35, 0], scale: [1, 1.25, 1] },
]

function CatSVG() {
  return (
    <svg width="100" height="122" viewBox="0 0 108 132" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* 尾巴：用 g translate 把旋转原点精确放在身体内部 */}
      <g transform="translate(60, 92)">
        {/* 尾巴主体 */}
        <motion.path
          d="M 0 0 C 26 -14 44 2 38 26 C 34 38 22 36 17 30"
          stroke="#F0ECF8"
          strokeWidth="13"
          fill="none"
          strokeLinecap="round"
          style={{ transformOrigin: '0px 0px' }}
          animate={{ rotate: [-12, 12, -12] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 尾尖淡紫色 */}
        <motion.circle
          cx="26"
          cy="30"
          r="7"
          fill="#D4C5E8"
          style={{ transformOrigin: '0px 0px' }}
          animate={{ rotate: [-12, 12, -12] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>

      {/* 身体（盖住尾巴根部） */}
      <ellipse cx="46" cy="88" rx="28" ry="21" fill="#FEFCFF" />
      {/* 腹部阴影，给白猫增加立体感 */}
      <ellipse cx="46" cy="96" rx="20" ry="9" fill="#EDE8F5" opacity="0.55" />

      {/* 前爪 */}
      <ellipse cx="33" cy="106" rx="10" ry="5.5" fill="#FEFCFF" />
      <ellipse cx="59" cy="106" rx="10" ry="5.5" fill="#FEFCFF" />
      {/* 爪垫（粉色） */}
      <ellipse cx="33" cy="107" rx="6" ry="3.2" fill="#FFB8C8" opacity="0.65" />
      <ellipse cx="59" cy="107" rx="6" ry="3.2" fill="#FFB8C8" opacity="0.65" />

      {/* 头部 */}
      <circle cx="46" cy="50" r="26" fill="#FEFCFF" />

      {/* 耳朵 */}
      <polygon points="26,36 20,12 40,32" fill="#FEFCFF" />
      <polygon points="27,35 23,17 38,32" fill="#FFB8C8" />
      <polygon points="66,36 72,12 52,32" fill="#FEFCFF" />
      <polygon points="65,35 69,17 54,32" fill="#FFB8C8" />

      {/* 脸部轮廓阴影（淡紫，不抢白色主色） */}
      <ellipse cx="46" cy="58" rx="18" ry="12" fill="#EDE8F5" opacity="0.4" />

      {/* 眼睛 */}
      <ellipse cx="36" cy="48" rx="7.2" ry="7.8" fill="white" />
      <ellipse cx="56" cy="48" rx="7.2" ry="7.8" fill="white" />
      {/* 虹膜：天蓝色 */}
      <circle cx="36" cy="49" r="5" fill="#7EC8E3" />
      <circle cx="56" cy="49" r="5" fill="#7EC8E3" />
      {/* 瞳孔 */}
      <ellipse cx="36.5" cy="49" rx="2.2" ry="3.4" fill="#1a202c" />
      <ellipse cx="56.5" cy="49" rx="2.2" ry="3.4" fill="#1a202c" />
      {/* 高光 */}
      <circle cx="39" cy="47" r="1.5" fill="white" />
      <circle cx="59" cy="47" r="1.5" fill="white" />

      {/* 鼻子 */}
      <ellipse cx="46" cy="59.5" rx="3.2" ry="2.4" fill="#FFB8C8" />
      {/* 嘴 */}
      <path d="M 42 62 Q 46 66 50 62" stroke="#FFB8C8" strokeWidth="1.3" fill="none" strokeLinecap="round"/>

      {/* 胡须 */}
      <line x1="41" y1="58.5" x2="19" y2="54.5" stroke="#ddd" strokeWidth="0.9" />
      <line x1="41" y1="61" x2="19" y2="61" stroke="#ddd" strokeWidth="0.9" />
      <line x1="41" y1="63.5" x2="19" y2="67.5" stroke="#ddd" strokeWidth="0.9" />
      <line x1="51" y1="58.5" x2="73" y2="54.5" stroke="#ddd" strokeWidth="0.9" />
      <line x1="51" y1="61" x2="73" y2="61" stroke="#ddd" strokeWidth="0.9" />
      <line x1="51" y1="63.5" x2="73" y2="67.5" stroke="#ddd" strokeWidth="0.9" />
    </svg>
  )
}

export function CatMascot() {
  const controls = useAnimation()
  const [busy, setBusy] = useState(false)
  const [popup, setPopup] = useState<string | null>(null)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)

    const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
    const emoji = POPUPS[Math.floor(Math.random() * POPUPS.length)]
    setPopup(emoji)

    await controls.start({
      ...reaction,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    })

    setTimeout(() => setPopup(null), 700)
    setBusy(false)
  }

  return (
    <div
      className="fixed bottom-6 left-5 z-40 cursor-pointer select-none"
      onClick={handleClick}
      title="点我~"
    >
      <div className="relative">
        <AnimatePresence>
          {popup && (
            <motion.div
              key={popup + Date.now()}
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-xl pointer-events-none"
              initial={{ opacity: 0, y: 0, scale: 0.3 }}
              animate={{ opacity: 1, y: -18, scale: 1 }}
              exit={{ opacity: 0, y: -36, scale: 0.5 }}
              transition={{ duration: 0.45 }}
            >
              {popup}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={controls}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CatSVG />
        </motion.div>
      </div>
    </div>
  )
}
