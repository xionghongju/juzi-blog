import { getTags } from '@/services/tag.service'
import { TagsManager } from '@/components/admin/Taxonomy/TagsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '标签管理 - 后台管理' }

export default async function TagsPage() {
  const { data: tags } = await getTags()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">标签管理</h1>
      <TagsManager tags={tags ?? []} />
    </div>
  )
}
