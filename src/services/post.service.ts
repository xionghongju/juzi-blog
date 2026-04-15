import { supabase } from '@/lib/supabase'
import { Post } from '@/types'
import { PAGE_SIZE } from '@/lib/constants'

export const getPosts = async (page = 1, categoryId?: number) => {
  let query = supabase
    .from('posts')
    .select('*, category:categories(*), tags:post_tags(tag:tags(*))', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (categoryId) query = query.eq('category_id', categoryId)

  return query
}

export const getPostBySlug = async (slug: string) => {
  return supabase
    .from('posts')
    .select('*, category:categories(*), tags:post_tags(tag:tags(*))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
}

export const searchPosts = async (keyword: string) => {
  return supabase
    .from('posts')
    .select('id, title, slug, created_at')
    .eq('status', 'published')
    .textSearch('title', keyword)
    .limit(10)
}

export const incrementViewCount = async (id: number) => {
  return supabase.rpc('increment_view_count', { post_id: id })
}

// 后台管理
export const getAllPosts = async (page = 1) => {
  return supabase
    .from('posts')
    .select('*, category:categories(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
}

export const createPost = async (post: Partial<Post>) => {
  return supabase.from('posts').insert(post).select().single()
}

export const updatePost = async (id: number, post: Partial<Post>) => {
  return supabase.from('posts').update(post).eq('id', id).select().single()
}

export const deletePost = async (id: number) => {
  return supabase.from('posts').delete().eq('id', id)
}
