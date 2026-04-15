import { NextRequest } from 'next/server'
import { getChatModel } from '@/lib/gemini'
import { htmlToText } from '@/lib/html-to-text'

export async function POST(req: NextRequest) {
  try {
    const { content, title, tags } = await req.json()
    if (!content?.trim()) return Response.json({ error: '请先输入正文内容' }, { status: 400 })
    if (!tags?.length) return Response.json({ ids: [] })

    const text = htmlToText(content)
    const tagList = tags.map((t: { id: number; name: string }) => `${t.id}:${t.name}`).join(', ')

    const prompt = `根据以下博客文章内容，从给定的标签列表中选出最相关的 3~5 个标签。

文章标题：${title || '（无）'}
文章内容（节选）：
${text.slice(0, 2000)}

可选标签（格式为 id:名称）：${tagList}

只输出最相关的标签 id，用英文逗号分隔，例如：1,3,5
不要任何解释，只输出 id 数字。`

    const model = getChatModel()
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    // 解析返回的 id 列表
    const ids = raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && tags.some((t: { id: number }) => t.id === n))

    return Response.json({ ids })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
