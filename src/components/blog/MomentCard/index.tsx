'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MapPin } from 'lucide-react'
import { Moment } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { MOOD_OPTIONS } from '@/lib/constants'
import { useState } from 'react'
import { likeMoment } from '@/services/moment.service'

interface Props {
  moment: Moment
  index?: number
  isLast?: boolean
}

export function MomentCard({ moment, index = 0, isLast = false }: Props) {
  const [likes, setLikes] = useState(moment.likes_count)
  const [liked, setLiked] = useState(false)

  const mood = MOOD_OPTIONS.find((m) => m.value === moment.mood)

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setLikes((l) => l + 1)
    await likeMoment(moment.id)
  }

  return (
    <div className="flex gap-4">
      {/* 时间轴左侧：emoji 圆点 + 连接线 */}
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.12, type: 'spring', stiffness: 260 }}
          className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-lg shadow-sm shrink-0 z-10"
        >
          {mood?.emoji ?? '💬'}
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.12 + 0.2, ease: 'easeOut' }}
            style={{ originY: 0 }}
            className="flex-1 w-px bg-gradient-to-b from-border/50 to-transparent mt-1"
          />
        )}
      </div>

      {/* 卡片内容 */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ x: 4, transition: { duration: 0.15 } }}
        className={`flex-1 min-w-0 pb-6 ${isLast ? 'pb-0' : ''}`}
      >
        <div className="p-5 rounded-2xl border border-border/50 bg-card hover:border-purple-500/30 hover:shadow-[0_4px_24px_rgba(168,85,247,0.1)] transition-all duration-300">
          {/* 元信息行 */}
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground/70">
              {formatRelativeTime(moment.created_at)}
            </span>
            {mood && (
              <span className="text-primary/80">{mood.label}</span>
            )}
            {moment.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {moment.location}
              </span>
            )}
          </div>

          {/* 正文 */}
          <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">{moment.content}</p>

          {/* 图片网格 */}
          {moment.images && moment.images.length > 0 && (
            <div className={`grid gap-1.5 mb-4 ${
              moment.images.length === 1
                ? 'grid-cols-1 max-w-xs'
                : moment.images.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}>
              {moment.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 33vw, 200px"
                    className="object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 点赞 */}
          <motion.button
            onClick={handleLike}
            aria-label={liked ? '取消点赞' : '点赞'}
            whileTap={{ scale: 0.8 }}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              liked
                ? 'text-pink-500 bg-pink-500/8'
                : 'text-muted-foreground hover:text-pink-500 hover:bg-pink-500/8'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${liked ? 'fill-pink-500 scale-110' : ''}`} />
            {likes > 0 && <span>{likes}</span>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
