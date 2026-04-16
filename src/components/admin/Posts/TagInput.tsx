'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Loader2, Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createTag } from '@/services/tag.service'
import { Tag } from '@/types'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  allTags: Tag[]
  selectedTagIds: number[]
  onChange: (ids: number[]) => void
  onSuggest: () => void
  suggesting: boolean
}

export function TagInput({ allTags, selectedTagIds, onChange, onSuggest, suggesting }: Props) {
  const [inputVal, setInputVal] = useState('')
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id))

  const removeTag = (id: number) => {
    onChange(selectedTagIds.filter((i) => i !== id))
  }

  // 过滤建议：排除已选中的，按输入词过滤
  const suggestions = inputVal.trim()
    ? allTags.filter(
        (t) =>
          !selectedTagIds.includes(t.id) &&
          t.name.toLowerCase().includes(inputVal.toLowerCase())
      )
    : []

  // 是否存在完全匹配的标签
  const exactMatch = allTags.find(
    (t) => t.name.toLowerCase() === inputVal.trim().toLowerCase()
  )

  const addTag = useCallback(
    async (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return

      // 已存在 → 直接选中
      const existing = allTags.find(
        (t) => t.name.toLowerCase() === trimmed.toLowerCase()
      )
      if (existing) {
        if (!selectedTagIds.includes(existing.id)) {
          onChange([...selectedTagIds, existing.id])
        }
        setInputVal('')
        return
      }

      // 不存在 → 创建新标签
      setCreating(true)
      const rawSlug = slugify(trimmed)
      const slug = rawSlug || `tag-${Date.now()}`
      const { data, error } = await createTag(trimmed, slug)
      setCreating(false)

      if (error || !data) {
        toast.error('创建标签失败：' + (error?.message || '未知错误'))
        return
      }

      // 把新标签追加到 allTags（局部更新，避免重新请求）
      allTags.push(data as Tag)
      onChange([...selectedTagIds, (data as Tag).id])
      setInputVal('')
      toast.success(`标签「${trimmed}」已创建`)
    },
    [allTags, selectedTagIds, onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputVal)
    }
    if (e.key === 'Backspace' && !inputVal && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id)
    }
  }

  return (
    <div className="space-y-2">
      {/* 已选标签 + 输入框 */}
      <div
        className="flex flex-wrap gap-1.5 min-h-10 px-3 py-2 rounded-lg border border-input bg-background cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag.id) }}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? '输入标签名，回车添加...' : ''}
          className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          disabled={creating}
        />
        {creating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground self-center" />}
      </div>

      {/* 下拉建议 */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          <span className="text-xs text-muted-foreground self-center">已有标签：</span>
          {suggestions.slice(0, 8).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
              onClick={() => addTag(tag.name)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* 提示：输入内容不在已有标签里 */}
      {inputVal.trim() && !exactMatch && suggestions.length === 0 && (
        <p className="text-xs text-muted-foreground px-1">
          按 Enter 创建新标签「{inputVal.trim()}」
        </p>
      )}

      {/* AI 推荐 */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSuggest}
          disabled={suggesting}
          className="h-6 gap-1 text-xs text-purple-400 hover:text-purple-300 px-2"
        >
          {suggesting
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Tags className="h-3 w-3" />}
          AI 推荐标签
        </Button>
      </div>
    </div>
  )
}
