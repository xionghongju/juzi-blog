import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      signIn: async (email, password) => {
        set({ isLoading: true })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ isLoading: false })
          return { error: error.message }
        }
        set({
          user: { id: data.user.id, email: data.user.email! },
          isLoading: false,
        })
        return { error: null }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },

      checkSession: async () => {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          set({ user: { id: data.session.user.id, email: data.session.user.email! } })
        }
      },
    }),
    { name: 'auth-store' }
  )
)
