import { getCategories } from '@/services/category.service'
import { CategoriesManager } from '@/components/admin/Taxonomy/CategoriesManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '分类管理 - 后台管理' }

export default async function CategoriesPage() {
  const { data: categories } = await getCategories()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">分类管理</h1>
      <CategoriesManager categories={categories ?? []} />
    </div>
  )
}
