import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'

const adminSupabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

// POST /api/related-posts — 计算并存储某篇文章的相关文章（发布文章时调用）
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${env.embedSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await req.json()
    if (!postId) {
      return Response.json({ error: '缺少 postId' }, { status: 400 })
    }

    // 调用 SQL 函数计算相关文章
    const { data: related, error } = await adminSupabase.rpc('get_related_posts', {
      p_post_id: postId,
      match_count: 3,
    })

    if (error) {
      console.error('计算相关文章失败:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!related || related.length === 0) {
      return Response.json({ success: true, count: 0 })
    }

    // 删除旧的相关文章记录，再写入新的
    await adminSupabase.from('related_posts').delete().eq('post_id', postId)

    const rows = related.map((r: { related_post_id: number; score: number }) => ({
      post_id: postId,
      related_post_id: r.related_post_id,
      score: r.score,
    }))

    const { error: insertError } = await adminSupabase.from('related_posts').insert(rows)
    if (insertError) {
      console.error('写入相关文章失败:', insertError)
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json({ success: true, count: rows.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}

// GET /api/related-posts?postId=xxx — 查询某篇文章的相关文章
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) return Response.json({ error: '缺少 postId' }, { status: 400 })

  const { data, error } = await supabase
    .from('related_posts')
    .select('score, post:related_post_id(id, title, slug, cover_image, published_at)')
    .eq('post_id', postId)
    .order('score', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
