import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: number | string
  icon: LucideIcon
  color?: string
}

export function StatCard({ title, value, icon: Icon, color = 'text-primary' }: Props) {
  return (
    <div className="p-6 rounded-2xl border border-border/50 bg-card">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={cn('p-2 rounded-lg bg-muted', color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
