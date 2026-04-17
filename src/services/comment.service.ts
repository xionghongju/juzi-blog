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

export const getCommentsWithReplies = async (postId: number) => {
  const { data: topLevel, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error || !topLevel?.length) return { data: topLevel ?? [], error }

  const ids = topLevel.map((c) => c.id)
  const { data: replies } = await supabase
    .from('comments')
    .select('*')
    .in('parent_id', ids)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  return {
    data: topLevel.map((c) => ({
      ...c,
      replies: replies?.filter((r) => r.parent_id === c.id) ?? [],
    })),
    error: null,
  }
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
