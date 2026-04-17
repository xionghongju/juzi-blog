import { NextRequest } from 'next/server'
import { getChatModel } from '@/lib/gemini'
import { htmlToText } from '@/lib/html-to-text'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    if (!checkRateLimit(`ai-excerpt:${ip}`, 100, 86_400_000)) {
      return Response.json({ error: '请求过于频繁，请明天再试' }, { status: 429 })
    }

    const { content, title } = await req.json()
    if (!content?.trim()) return Response.json({ error: '请先输入正文内容' }, { status: 400 })

    const text = htmlToText(content)
    const prompt = `请为以下博客文章生成一段简洁的摘要，要求：
- 100~150 字，用中文
- 概括文章核心内容和价值
- 语言自然流畅，适合作为文章预览
- 直接输出摘要内容，不要任何前缀或解释

文章标题：${title || '（无）'}
文章内容：
${text.slice(0, 3000)}`

    const model = getChatModel()
    const result = await model.generateContentStream(prompt)

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder()
        try {
          for await (const chunk of result.stream) {
            const t = chunk.text()
            if (t) controller.enqueue(enc.encode(t))
          }
        } catch (e) {
          console.error('ai-excerpt 流式错误:', e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
