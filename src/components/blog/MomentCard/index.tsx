'use client'

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
}

export function MomentCard({ moment, index = 0 }: Props) {
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="p-5 rounded-2xl border border-border/50 bg-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatRelativeTime(moment.created_at)}</span>
          {moment.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {moment.location}
            </span>
          )}
          {mood && <span>{mood.emoji} {mood.label}</span>}
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">{moment.content}</p>

      {moment.images && moment.images.length > 0 && (
        <div className={`grid gap-2 mb-4 ${moment.images.length === 1 ? 'grid-cols-1' : moment.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {moment.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="rounded-xl object-cover aspect-square w-full cursor-pointer hover:opacity-90 transition-opacity"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1">
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.85 }}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
            liked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-pink-500' : ''}`} />
          {likes > 0 && <span>{likes}</span>}
        </motion.button>
      </div>
    </motion.div>
  )
}
