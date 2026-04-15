'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2, XCircle, Loader2, Database, Bot, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { rebuildAllEmbeddings, type RebuildResult } from '@/app/actions/rebuild-embeddings'

type RebuildStatus = 'idle' | 'loading' | 'success' | 'error'

export function AiManager() {
  const [status, setStatus] = useState<RebuildStatus>('idle')
  const [result, setResult] = useState<RebuildResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleRebuild = async () => {
    if (status === 'loading') return
    setStatus('loading')
    setResult(null)
    setErrorMsg('')

    const res = await rebuildAllEmbeddings()

    if (res.success) {
      setResult(res.data)
      setStatus('success')
      toast.success(`向量索引重建完成：${res.data.posts} 篇文章，${res.data.chunks} 个块`)
    } else {
      setErrorMsg(res.error)
      setStatus('error')
      toast.error('重建失败：' + res.error)
    }
  }

  return (
    <div className="space-y-8">
      {/* 功能说明卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          icon={<Bot className="h-5 w-5 text-purple-400" />}
          title="AI 聊天（RAG）"
          desc="基于博客文章内容回答访客问题，使用向量检索找到最相关段落"
        />
        <FeatureCard
          icon={<Sparkles className="h-5 w-5 text-amber-400" />}
          title="AI 写作助手"
          desc="编辑器中选中文字可触发润色、扩写、缩短、续写操作"
        />
        <FeatureCard
          icon={<Database className="h-5 w-5 text-blue-400" />}
          title="相关文章推荐"
          desc="发布文章时自动计算相似文章，展示在文章末尾"
        />
      </div>

      {/* 向量索引管理 */}
      <div className="rounded-xl border border-border/50 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">向量索引管理</h2>
          <p className="text-sm text-muted-foreground mt-1">
            重建索引会重新为所有已发布文章生成向量，用于 AI 聊天检索和相关文章计算。
            <br />
            首次使用或批量修改文章后需手动触发；单篇文章发布时会自动更新。
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleRebuild}
            disabled={status === 'loading'}
            className="gap-2"
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {status === 'loading' ? '重建中…' : '重建全量索引'}
          </Button>

          {status === 'success' && result && (
            <div className="flex items-center gap-2 text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              完成：{result.posts} 篇文章，{result.chunks} 个向量块
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              {errorMsg}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
          <p>• 每篇文章大约生成 2–5 个向量块，耗时取决于文章数量</p>
          <p>• 重建期间 AI 聊天仍可正常使用（读取旧索引）</p>
          <p>• Gemini Embedding API 免费配额：1500 次/分钟</p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border/50 p-4 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
