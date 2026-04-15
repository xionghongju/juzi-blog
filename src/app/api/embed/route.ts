import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { generateEmbedding } from '@/lib/gemini'
import { htmlToText, chunkText } from '@/lib/html-to-text'

// 使用 service role key 写入数据库
const adminSupabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

export async function POST(req: NextRequest) {
  // 简单鉴权
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${env.embedSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 获取所有已发布文章
  const { data: posts, error } = await adminSupabase
    .from('posts')
    .select('id, title, content')
    .eq('status', 'published')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!posts?.length) return Response.json({ message: '没有已发布文章' })

  let total = 0

  for (const post of posts) {
    // 清除该文章旧的向量块
    await adminSupabase.from('post_chunks').delete().eq('post_id', post.id)

    // 将 HTML 转文本后分块
    const text = `${post.title}\n\n${htmlToText(post.content || '')}`
    const chunks = chunkText(text)

    // 逐块生成 Embedding 并写入
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk)
      await adminSupabase.from('post_chunks').insert({
        post_id: post.id,
        content: chunk,
        embedding,
      })
      total++
    }
  }

  return Response.json({ success: true, posts: posts.length, chunks: total })
}
