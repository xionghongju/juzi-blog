'use client'

import { useState } from 'react'
import { Moment } from '@/types'
import { deleteMoment } from '@/services/moment.service'
import { getMoments } from '@/services/moment.service'
import { MomentForm } from './MomentForm'
import { Button } from '@/components/ui/button'
import { Trash2, MapPin } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { MOOD_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'

interface Props {
  initialMoments: Moment[]
}

export function MomentsManager({ initialMoments }: Props) {
  const [moments, setMoments] = useState(initialMoments)

  const refresh = async () => {
    const { data } = await getMoments(1)
    setMoments(data || [])
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条动态？')) return
    const { error } = await deleteMoment(id)
    if (error) {
      toast.error('删除失败')
    } else {
      setMoments((m) => m.filter((item) => item.id !== id))
      toast.success('已删除')
    }
  }

  return (
    <div>
      <MomentForm onCreated={refresh} />

      <div className="space-y-4">
        {moments.map((moment) => {
          const mood = MOOD_OPTIONS.find((m) => m.value === moment.mood)
          return (
            <div key={moment.id} className="p-4 rounded-xl border border-border/50 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>{formatRelativeTime(moment.created_at)}</span>
                    {moment.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{moment.location}
                      </span>
                    )}
                    {mood && <span>{mood.emoji} {mood.label}</span>}
                  </div>
                  <p className="text-sm whitespace-pre-wrap mb-3">{moment.content}</p>
                  {moment.images && moment.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {moment.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="icon" variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleDelete(moment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
        {moments.length === 0 && (
          <p className="text-center text-muted-foreground py-10">暂无动态</p>
        )}
      </div>
    </div>
  )
}
