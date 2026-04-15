'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession().then(() => {
      const { user } = useAuthStore.getState()
      if (!user) router.replace('/login')
    })
  }, [checkSession, router])

  if (!user) return null

  return <>{children}</>
}
