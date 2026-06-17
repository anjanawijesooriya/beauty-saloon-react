import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FDF2F6',
          100: '#FBDFE9',
          200: '#F7BECE',
          300: '#EF8DAD',
          400: '#D4537E',
          500: '#C23A64',
          600: '#A82C53',
          700: '#8B2244',
          800: '#6E1A35',
          900: '#52122A',
        },
        gold: {
          300: '#F5D98E',
          400: '#E8C062',
          500: '#D4A832',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 2px 20px rgba(212, 83, 126, 0.08)',
        'card-hover': '0 8px 40px rgba(212, 83, 126, 0.16)',
        modal: '0 24px 64px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config
