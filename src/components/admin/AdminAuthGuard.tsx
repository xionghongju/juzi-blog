'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    // 只在组件挂载时检查一次会话
    const checkAuth = async () => {
      const { checkSession } = useAuthStore.getState()
      await checkSession()
      const { user } = useAuthStore.getState()
      if (!user) router.replace('/login')
    }
    checkAuth()
  }, [router])

  if (!user) return null

  return <>{children}</>
}
