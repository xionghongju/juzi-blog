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
    .select('*, category:categories(*), tags:post_tags(tag:tags(*))')
    .eq('status', 'published')
    .or(`title.ilike.%${keyword}%,excerpt.ilike.%${keyword}%`)
    .order('created_at', { ascending: false })
    .limit(20)
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

/** 同步文章标签：先删旧记录，再批量插入新记录 */
export const syncPostTags = async (postId: number, tagIds: number[]) => {
  await supabase.from('post_tags').delete().eq('post_id', postId)
  if (tagIds.length === 0) return
  await supabase.from('post_tags').insert(tagIds.map(tag_id => ({ post_id: postId, tag_id })))
}

export const getPostsByTag = async (tagId: number) => {
  const { data: postTags } = await supabase
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tagId)

  if (!postTags?.length) return { data: [] as Post[], error: null }

  return supabase
    .from('posts')
    .select('*, category:categories(*), tags:post_tags(tag:tags(*))')
    .eq('status', 'published')
    .in('id', postTags.map((pt) => pt.post_id))
    .order('published_at', { ascending: false })
}

export const getPostsByCategory = async (categoryId: number) => {
  return supabase
    .from('posts')
    .select('*, category:categories(*), tags:post_tags(tag:tags(*))')
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false })
}

export const getRelatedPosts = async (postId: number) => {
  return supabase
    .from('related_posts')
    .select('score, post:related_post_id(id, title, slug, cover_image, published_at)')
    .eq('post_id', postId)
    .order('score', { ascending: false })
    .limit(3)
}
