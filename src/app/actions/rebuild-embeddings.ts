'use server'

import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { generateEmbedding } from '@/lib/gemini'
import { htmlToText, chunkText } from '@/lib/html-to-text'

const adminSupabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

export interface RebuildResult {
  posts: number
  chunks: number
}

/** 重建所有已发布文章的向量索引 */
export async function rebuildAllEmbeddings(): Promise<{ success: true; data: RebuildResult } | { success: false; error: string }> {
  try {
    const { data: posts, error } = await adminSupabase
      .from('posts')
      .select('id, title, content')
      .eq('status', 'published')

    if (error) return { success: false, error: error.message }
    if (!posts?.length) return { success: true, data: { posts: 0, chunks: 0 } }

    let totalChunks = 0

    for (const post of posts) {
      await adminSupabase.from('post_chunks').delete().eq('post_id', post.id)

      const text = `${post.title}\n\n${htmlToText(post.content || '')}`
      const chunks = chunkText(text)

      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk)
        await adminSupabase.from('post_chunks').insert({
          post_id: post.id,
          content: chunk,
          embedding,
        })
        totalChunks++
      }
    }

    return { success: true, data: { posts: posts.length, chunks: totalChunks } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
