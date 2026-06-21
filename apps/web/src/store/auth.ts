import { create } from 'zustand'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'STYLIST' | 'ADMIN'
  avatarUrl?: string | null
  phone?: string | null
  referralCode?: string | null
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('glowher-token'),
  initialized: false,

  login: async (email, password) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password })
    localStorage.setItem('glowher-token', data.token)
    set({ user: data.user, token: data.token })
  },

  register: async (name, email, password, phone) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
      name,
      email,
      password,
      phone,
    })
    localStorage.setItem('glowher-token', data.token)
    set({ user: data.user, token: data.token })
  },

  logout: () => {
    localStorage.removeItem('glowher-token')
    set({ user: null, token: null })
    queryClient.clear()
    api.post('/auth/logout').catch(() => {})
  },

  setUser: (user) => set({ user }),

  initialize: async () => {
    const token = localStorage.getItem('glowher-token')
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const { data } = await api.get<AuthUser>('/auth/me')
      set({ user: data, initialized: true })
    } catch {
      localStorage.removeItem('glowher-token')
      set({ token: null, initialized: true })
    }
  },
}))
