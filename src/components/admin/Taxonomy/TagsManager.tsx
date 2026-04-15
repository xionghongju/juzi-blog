'use client'

import { createTag, deleteTag } from '@/services/tag.service'
import { TaxonomyManager } from './TaxonomyManager'
import { Tag } from '@/types'

interface Props {
  tags: Tag[]
}

export function TagsManager({ tags }: Props) {
  return (
    <TaxonomyManager
      items={tags}
      onCreate={createTag}
      onDelete={deleteTag}
      nameLabel="标签"
      emptyText="暂无标签，添加第一个标签吧"
      deleteConfirmText={(name) => `确认删除标签「${name}」？文章上的标签关联会一并移除。`}
    />
  )
}
