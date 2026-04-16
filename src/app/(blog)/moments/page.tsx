export const dynamic = 'force-dynamic'

import { getMoments } from '@/services/moment.service'
import { MomentCard } from '@/components/blog/MomentCard'
import { MomentsPagination } from '@/components/blog/MomentCard/MomentsPagination'
import { PAGE_SIZE } from '@/lib/constants'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: '朋友圈' }

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function MomentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page || 1)
  const { data: moments, count } = await getMoments(page)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">朋友圈</h1>
        <p className="text-muted-foreground">记录生活里的每一个瞬间 📸</p>
      </div>

      <div className="space-y-4">
        {moments && moments.length > 0 ? (
          moments.map((moment, i) => (
            <MomentCard key={moment.id} moment={moment} index={i} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-20">暂无动态</p>
        )}
      </div>

      <Suspense>
        <MomentsPagination page={page} total={count || 0} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
