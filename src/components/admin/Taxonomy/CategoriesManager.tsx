'use client'

import { createCategory, deleteCategory } from '@/services/category.service'
import { TaxonomyManager } from './TaxonomyManager'
import { Category } from '@/types'

interface Props {
  categories: Category[]
}

export function CategoriesManager({ categories }: Props) {
  return (
    <TaxonomyManager
      items={categories}
      onCreate={createCategory}
      onDelete={deleteCategory}
      nameLabel="分类"
      emptyText="暂无分类，添加第一个分类吧"
      deleteConfirmText={(name) => `确认删除分类「${name}」？该分类下的文章不会被删除，但会失去分类关联。`}
    />
  )
}
