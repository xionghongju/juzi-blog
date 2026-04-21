'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  // 当 URL q 参数变化时同步搜索框（如浏览器前进/后退）
  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleSearch = (keyword: string) => {
    setValue(keyword)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (keyword) {
        params.set('q', keyword)
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.push(`/posts?${params.toString()}`)
    })
  }

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索文章..."
        className="pl-10 rounded-xl bg-muted/50"
      />
    </div>
  )
}
