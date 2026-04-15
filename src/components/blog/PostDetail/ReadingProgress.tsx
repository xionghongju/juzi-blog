'use client'

import { useEffect, useState, useRef } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      setProgress((scrollTop / (scrollHeight - clientHeight)) * 100)
    }
    
    // 使用 requestAnimationFrame 在浏览器绘制周期内更新，避免频繁 setState
    const handleScroll = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(update)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
