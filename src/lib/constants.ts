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
  { label: '兴奋', value: 'excited', emoji: '🤩' },
  { label: '难过', value: 'sad', emoji: '😢' },
  { label: '疲惫', value: 'tired', emoji: '😴' },
  { label: '搞笑', value: 'funny', emoji: '🤣' },
  { label: '期待', value: 'anticipating', emoji: '🥰' },
  { label: '焦虑', value: 'anxious', emoji: '😰' },
  { label: '无聊', value: 'bored', emoji: '😑' },
  { label: '惊喜', value: 'surprised', emoji: '🤯' },
  { label: '愤怒', value: 'angry', emoji: '😤' },
  { label: '感恩', value: 'grateful', emoji: '🙏' },
  { label: '治愈', value: 'healing', emoji: '🌸' },
  { label: '摸鱼', value: 'slacking', emoji: '🐟' },
  { label: '破防了', value: 'broken', emoji: '😭' },
  { label: '牛啊', value: 'awesome', emoji: '🐂' },
  { label: '吃货', value: 'foodie', emoji: '🍜' },
] as const
