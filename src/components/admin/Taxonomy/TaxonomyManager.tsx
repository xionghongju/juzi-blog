'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'

interface Item {
  id: number
  name: string
  slug: string
}

interface Props {
  items: Item[]
  onCreate: (name: string, slug: string) => Promise<{ error: { message: string } | null }>
  onDelete: (id: number) => Promise<{ error: { message: string } | null }>
  nameLabel?: string
  emptyText?: string
  deleteConfirmText?: (name: string) => string
}

export function TaxonomyManager({
  items: initialItems,
  onCreate,
  onDelete,
  nameLabel = '名称',
  emptyText = '暂无数据',
  deleteConfirmText = (name) => `确认删除「${name}」？关联文章的数据不会被删除。`,
}: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slugEdited) {
      const generated = slugify(val)
      // slugify 会丢弃中文，只在有实际结果时自动填入
      if (generated) setSlug(generated)
    }
  }

  const handleAdd = async () => {
    if (!name.trim()) return toast.error(`请输入${nameLabel}`)
    if (!slug.trim()) return toast.error('请输入 Slug')

    setAdding(true)
    const { error } = await onCreate(name.trim(), slug.trim())
    setAdding(false)

    if (error) {
      toast.error('创建失败：' + error.message)
      return
    }

    // 乐观更新：加一个临时 id，刷新页面会得到真实数据
    const tempItem: Item = { id: Date.now(), name: name.trim(), slug: slug.trim() }
    setItems(prev => [...prev, tempItem].sort((a, b) => a.name.localeCompare(b.name)))
    setName('')
    setSlug('')
    setSlugEdited(false)
    toast.success('创建成功')
  }

  const handleDelete = async (item: Item) => {
    if (!confirm(deleteConfirmText(item.name))) return

    setDeletingId(item.id)
    const { error } = await onDelete(item.id)
    setDeletingId(null)

    if (error) {
      toast.error('删除失败：' + error.message)
      return
    }

    setItems(prev => prev.filter(i => i.id !== item.id))
    toast.success('已删除')
  }

  return (
    <div className="space-y-6">
      {/* 新增表单 */}
      <div className="rounded-xl border border-border/50 p-4 space-y-3">
        <p className="text-sm font-medium">新增{nameLabel}</p>
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={`${nameLabel}，如：技术`}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
              placeholder="slug，如：tech（英文名自动生成，中文请手动填写）"
              className="font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={adding} className="self-start">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            添加
          </Button>
        </div>
      </div>

      {/* 列表 */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">{emptyText}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">名称</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Slug</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{item.slug}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
