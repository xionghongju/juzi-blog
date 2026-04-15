import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { generateEmbedding } from '@/lib/gemini'
import { htmlToText, chunkText } from '@/lib/html-to-text'

// 使用 service role key 写入数据库
const adminSupabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

export async function POST(req: NextRequest) {
  try {
    // 简单鉴权
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${env.embedSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📝 开始生成文章向量...')

    // 获取所有已发布文章
    const { data: posts, error } = await adminSupabase
      .from('posts')
      .select('id, title, content')
      .eq('status', 'published')

    if (error) {
      console.error('❌ 查询文章失败:', error)
      return Response.json({ error: `数据库错误: ${error.message}` }, { status: 500 })
    }

    if (!posts?.length) {
      console.log('⚠️  没有已发布的文章')
      return Response.json({ message: '没有已发布文章', posts: 0, chunks: 0 })
    }

    console.log(`✅ 找到 ${posts.length} 篇文章，开始生成向量...`)

    let total = 0

    for (const post of posts) {
      try {
        // 清除该文章旧的向量块
        await adminSupabase.from('post_chunks').delete().eq('post_id', post.id)

        // 将 HTML 转文本后分块
        const text = `${post.title}\n\n${htmlToText(post.content || '')}`
        const chunks = chunkText(text)

        console.log(`📄 处理文章 ${post.id} "${post.title}" - ${chunks.length} 个块`)

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

        console.log(`✅ 文章 ${post.id} 完成！`)
      } catch (postError) {
        console.error(`❌ 处理文章 ${post.id} 失败:`, postError)
        throw postError
      }
    }

    console.log(`🎉 完成！共生成 ${total} 个向量块`)
    return Response.json({ success: true, posts: posts.length, chunks: total })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('🔥 API 错误:', errorMsg)
    return Response.json(
      {
        error: `处理失败: ${errorMsg}`,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
