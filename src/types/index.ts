export * from './post'
export * from './moment'
export * from './comment'

export interface SiteSettings {
  id: number
  site_name: string
  description?: string
  avatar?: string
  github_url?: string
  twitter_url?: string
  beian?: string
}

export interface Subscriber {
  id: number
  email: string
  status: 'active' | 'unsubscribed'
  created_at: string
}

export interface Media {
  id: number
  url: string
  filename: string
  file_type: 'image' | 'video'
  file_size: number
  created_at: string
}
