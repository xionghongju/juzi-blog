'use server'

import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { generateEmbedding } from '@/lib/gemini'
import { htmlToText, chunkText } from '@/lib/html-to-text'

const adminSupabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

/** 为单篇文章生成/更新向量块，发布或更新文章时调用 */
export async function embedPost(postId: number) {
  const { data: post, error } = await adminSupabase
    .from('posts')
    .select('id, title, content')
    .eq('id', postId)
    .single()

  if (error || !post) {
    console.error('embedPost: 查询文章失败', error)
    return
  }

  // 删除旧向量块
  await adminSupabase.from('post_chunks').delete().eq('post_id', postId)

  const text = `${post.title}\n\n${htmlToText(post.content || '')}`
  const chunks = chunkText(text)

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk)
      await adminSupabase.from('post_chunks').insert({
        post_id: postId,
        content: chunk,
        embedding,
      })
    } catch (e) {
      console.error('embedPost: 生成向量失败', e)
    }
  }
}
