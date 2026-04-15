import { getMoments } from '@/services/moment.service'
import { MomentsManager } from '@/components/admin/Moments/MomentsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '动态管理 - 后台管理' }

export default async function AdminMomentsPage() {
  const { data: moments } = await getMoments(1)
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">动态管理</h1>
      <MomentsManager initialMoments={moments || []} />
    </div>
  )
}
