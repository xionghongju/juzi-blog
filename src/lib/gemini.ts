import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from './env'

const genAI = new GoogleGenerativeAI(env.geminiApiKey)

export const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })

export function getChatModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }], role: 'user' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outputDimensionality: 768,
  } as any)
  return result.embedding.values
}
