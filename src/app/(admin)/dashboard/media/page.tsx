import { supabase } from '@/lib/supabase'
import { MediaManager } from '@/components/admin/Media/MediaManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '素材库 - 后台管理' }

export default async function MediaPage() {
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">素材库</h1>
      <MediaManager initialMedia={media || []} />
    </div>
  )
}
