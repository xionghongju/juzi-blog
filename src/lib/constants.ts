export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const PAGE_SIZE = 10

export const SITE_CONFIG = {
  name: '橘子的博客',
  description: '记录生活，分享技术',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const

export const MOOD_OPTIONS = [
  { label: '开心', value: 'happy', emoji: '😊' },
  { label: '平静', value: 'calm', emoji: '😌' },
  { label: '沉思', value: 'thoughtful', emoji: '🤔' },
  { label: '随手拍', value: 'snap', emoji: '📸' },
  { label: '感动', value: 'touched', emoji: '🥹' },
] as const
