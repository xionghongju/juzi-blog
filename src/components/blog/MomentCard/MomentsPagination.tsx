'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  total: number
  pageSize: number
}

export function MomentsPagination({ page, total, pageSize }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/moments?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => go(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
      <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => go(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
