import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

const savedTheme = (localStorage.getItem('glowher-theme') as Theme) || 'light'
document.documentElement.classList.toggle('dark', savedTheme === 'dark')

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: savedTheme,
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('glowher-theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return { theme: next }
    }),
}))
