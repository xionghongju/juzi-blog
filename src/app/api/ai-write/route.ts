import { NextRequest } from 'next/server'
import { getChatModel } from '@/lib/gemini'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const PROMPTS: Record<string, (text: string) => string> = {
  polish: (text) =>
    `请对以下文字进行润色，让表达更流畅自然、更有文采，保持原意和语言风格，直接输出润色后的内容，不要任何解释：\n\n${text}`,
  expand: (text) =>
    `请对以下文字进行扩写，补充细节、例子或背景信息，使内容更丰富饱满，保持原有风格，直接输出扩写后的内容，不要任何解释：\n\n${text}`,
  shorten: (text) =>
    `请对以下文字进行精简，去掉冗余表达，保留核心意思，直接输出精简后的内容，不要任何解释：\n\n${text}`,
  continue: (text) =>
    `请根据以下内容续写一段话，保持相同的风格、语气和话题方向，直接输出续写内容，不要任何解释：\n\n${text}`,
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!checkRateLimit(`ai-write:${ip}`, 100, 86_400_000)) {
      return Response.json({ error: '请求过于频繁，请明天再试' }, { status: 429 })
    }

    const { text, action } = await req.json()
    if (!text?.trim()) return Response.json({ error: '请先选中文字' }, { status: 400 })
    if (text.length > 5000) return Response.json({ error: '文字长度不能超过 5000 字符' }, { status: 400 })

    const promptFn = PROMPTS[action]
    if (!promptFn) return Response.json({ error: '无效操作' }, { status: 400 })

    const model = getChatModel()
    const result = await model.generateContentStream(promptFn(text))

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder()
        try {
          for await (const chunk of result.stream) {
            const t = chunk.text()
            if (t) controller.enqueue(enc.encode(t))
          }
        } catch (e) {
          console.error('ai-write 流式错误:', e)
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
