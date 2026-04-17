type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

// 每 10 分钟清理一次过期 entry，避免内存无限增长
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 600_000)

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

/** 从 x-forwarded-for header 安全提取第一个客户端 IP */
export function getClientIp(req: { headers: { get: (key: string) => string | null } }): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (!forwarded) return 'unknown'
  return forwarded.split(',')[0].trim() || 'unknown'
}
