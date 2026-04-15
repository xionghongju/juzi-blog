import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { generateEmbedding, getChatModel } from '@/lib/gemini'

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)

// 简单内存限流：每个 IP 每天最多 30 次
const rateMap = new Map<string, { count: number; resetAt: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 86_400_000 })
    return true
  }
  if (entry.count >= 30) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    if (!checkRate(ip)) {
      return Response.json({ error: '今日提问次数已达上限，明天再来吧 😊' }, { status: 429 })
    }

    const { message, history = [] } = await req.json()
    if (!message?.trim()) {
      return Response.json({ error: '请输入问题' }, { status: 400 })
    }

    // 1. 生成问题的 Embedding
    const queryEmbedding = await generateEmbedding(message)

    // 2. 检索相关文章块
    const { data: chunks, error: rpcError } = await supabase.rpc('match_post_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
    })

    if (rpcError) {
      console.error('RAG 检索失败:', rpcError)
    }

    // 3. 整理上下文和来源文章
    const hasContext = chunks && chunks.length > 0
    const sources: { title: string; slug: string }[] = []
    let contextText = ''

    if (hasContext) {
      const seen = new Set<number>()
      for (const chunk of chunks) {
        contextText += `\n\n[来自文章《${chunk.post_title}》]\n${chunk.content}`
        if (!seen.has(chunk.post_id)) {
          seen.add(chunk.post_id)
          sources.push({ title: chunk.post_title, slug: chunk.post_slug })
        }
      }
    }

    // 4. 构造系统 Prompt
    const systemPrompt = hasContext
      ? `你是「橘子的博客」的 AI 助手，名叫橘子小助手🍊。博主橘子是一名全栈开发者，热爱技术与生活。
请基于以下博客内容回答用户问题，回答要简洁友好，使用中文。
如果内容不足以完整回答，可以补充你的知识，但请说明哪部分来自博客。

博客相关内容：${contextText}`
      : `你是「橘子的博客」的 AI 助手，名叫橘子小助手🍊。博主橘子是一名全栈开发者，热爱技术与生活。
博客里暂时没有与此问题直接相关的文章，请基于你的知识友好地回答，并可以建议用户期待博主后续写相关内容。
回答要简洁友好，使用中文。`

    // 5. 构建对话历史
    const chatHistory = history.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }))

    // 6. 流式生成回答
    const model = getChatModel()
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }],
      },
    })

    const result = await chat.sendMessageStream(message)

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder()
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(enc.encode(text))
          }
          if (sources.length > 0) {
            controller.enqueue(enc.encode(`\n\n@@SOURCES@@${JSON.stringify(sources)}`))
          }
        } catch (streamErr) {
          console.error('流式输出错误:', streamErr)
          controller.enqueue(enc.encode('抱歉，生成回答时出错了，请重试。'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('Chat API 错误:', err)
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: `服务出错：${message}` }, { status: 500 })
  }
}
