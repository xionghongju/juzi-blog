export interface Comment {
  id: number
  content: string
  author_name: string
  author_email: string
  post_id?: number
  moment_id?: number
  parent_id?: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  replies?: Comment[]
}
