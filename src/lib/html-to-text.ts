/** 将 Tiptap 输出的 HTML 转为纯文本，用于 Embedding */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|h[1-6]|li|blockquote|div)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** 将长文本切成小块（约 400 字符一块），用于分块 Embedding */
export function chunkText(text: string, maxLen = 400): string[] {
  const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(s => s.length > 10)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if (current.length + para.length > maxLen && current) {
      chunks.push(current.trim())
      current = para
    } else {
      current += (current ? '\n' : '') + para
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}
