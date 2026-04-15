import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from './env'

const genAI = new GoogleGenerativeAI(env.geminiApiKey)

export const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })

export function getChatModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}
