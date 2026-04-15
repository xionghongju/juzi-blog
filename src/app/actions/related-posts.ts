'use server'

import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

const adminSupabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

export async function computeRelatedPosts(postId: number) {
  const { data: related, error } = await adminSupabase.rpc('get_related_posts', {
    p_post_id: postId,
    match_count: 3,
  })

  if (error) {
    console.error('计算相关文章失败:', error)
    return
  }

  if (!related || related.length === 0) return

  await adminSupabase.from('related_posts').delete().eq('post_id', postId)

  await adminSupabase.from('related_posts').insert(
    related.map((r: { related_post_id: number; score: number }) => ({
      post_id: postId,
      related_post_id: r.related_post_id,
      score: r.score,
    }))
  )
}
