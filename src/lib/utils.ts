import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return format(new Date(date), 'yyyy年MM月dd日', { locale: zhCN })
}

export function formatRelativeTime(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + '...' : text
}

// 估算阅读时间（分钟）：中文 400字/分钟，英文 200词/分钟
export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (text.replace(/[\u4e00-\u9fa5]/g, '').match(/\b\w+\b/g) || []).length
  const minutes = chineseChars / 400 + englishWords / 200
  return Math.max(1, Math.round(minutes))
}
