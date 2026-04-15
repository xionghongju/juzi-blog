import { AiManager } from '@/components/admin/Ai/AiManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'AI 管理 - 后台管理' }

export default function AiPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">AI 管理</h1>
      <AiManager />
    </div>
  )
}
