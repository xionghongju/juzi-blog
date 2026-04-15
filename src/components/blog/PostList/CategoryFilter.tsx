'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Category } from '@/types'

interface Props {
  categories: Category[]
}

export function CategoryFilter({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category')

  const select = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else params.delete('category')
    router.push(`/posts?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Badge
        variant={!current ? 'default' : 'outline'}
        className={cn('cursor-pointer', !current && 'bg-primary text-primary-foreground')}
        onClick={() => select(null)}
      >
        全部
      </Badge>
      {categories.map((cat) => (
        <Badge
          key={cat.id}
          variant={current === cat.slug ? 'default' : 'outline'}
          className={cn('cursor-pointer', current === cat.slug && 'bg-primary text-primary-foreground')}
          onClick={() => select(cat.slug)}
        >
          {cat.name}
        </Badge>
      ))}
    </div>
  )
}
