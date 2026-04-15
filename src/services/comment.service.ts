import { supabase } from '@/lib/supabase'
import { Comment } from '@/types'

export const getCommentsByPost = async (postId: number) => {
  return supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
}

export const getCommentsByMoment = async (momentId: number) => {
  return supabase
    .from('comments')
    .select('*')
    .eq('moment_id', momentId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
}

export const createComment = async (comment: Partial<Comment>) => {
  return supabase.from('comments').insert(comment).select().single()
}

// 后台管理
export const getAllComments = async (status?: string) => {
  let query = supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  return query
}

export const updateCommentStatus = async (id: number, status: 'approved' | 'rejected') => {
  return supabase.from('comments').update({ status }).eq('id', id)
}

export const deleteComment = async (id: number) => {
  return supabase.from('comments').delete().eq('id', id)
}
