export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  status: 'draft' | 'published'
  view_count: number
  category_id?: number
  published_at?: string
  created_at: string
  updated_at: string
  category?: Category
  tags?: Tag[]
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface PostTag {
  post_id: number
  tag_id: number
}
