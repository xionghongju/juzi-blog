'use client'

import { useState, useEffect } from 'react'

interface Props {
  texts: string[]
  speed?: number
  pause?: number
}

export function TypewriterText({ texts, speed = 100, pause = 2000 }: Props) {
  const [displayed, setDisplayed] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIndex]

    const timeout = setTimeout(() => {
      setDisplayed(current.slice(0, isDeleting ? charIndex - 1 : charIndex + 1))
      
      if (!isDeleting) {
        // 正在输入
        if (charIndex + 1 === current.length) {
          // 输入完成，延迟后开始删除
          setTimeout(() => setIsDeleting(true), pause)
        } else {
          setCharIndex((c) => c + 1)
        }
      } else {
        // 正在删除
        if (charIndex - 1 === 0) {
          // 删除完成，切换到下一个文本
          setIsDeleting(false)
          setTextIndex((i) => (i + 1) % texts.length)
          setCharIndex(0)
        } else {
          setCharIndex((c) => c - 1)
        }
      }
    }, isDeleting ? speed / 2 : speed)

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, textIndex, texts, speed, pause])

  return (
    <span className="text-primary font-medium">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  )
}
