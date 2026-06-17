import { create } from 'zustand'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'STYLIST' | 'ADMIN'
  avatarUrl?: string
  phone?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('glowher-token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('glowher-token', data.token)
    set({ user: data.user, token: data.token, isLoading: false })
  },

  register: async (name, email, password, phone) => {
    set({ isLoading: true })
    const { data } = await api.post('/auth/register', { name, email, password, phone })
    localStorage.setItem('glowher-token', data.token)
    set({ user: data.user, token: data.token, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('glowher-token')
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user }),

  initialize: async () => {
    const token = localStorage.getItem('glowher-token')
    if (!token) return
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data })
    } catch {
      localStorage.removeItem('glowher-token')
      set({ token: null })
    }
  },
}))
