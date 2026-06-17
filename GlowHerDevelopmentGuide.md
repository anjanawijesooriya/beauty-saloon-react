# GlowHer — Full-Stack Development Guide
### Beauty Salon Platform · Sri Lanka Market · React + Node.js

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Recommended Tech Stack](#2-recommended-tech-stack)
3. [Database Recommendation](#3-database-recommendation)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Design System](#5-design-system)
6. [Environment Setup](#6-environment-setup)
7. [Phase 1 — MVP](#7-phase-1--mvp)
8. [Phase 2 — Payments & Shop](#8-phase-2--payments--shop)
9. [Phase 3 — Loyalty, Reviews & Notifications](#9-phase-3--loyalty-reviews--notifications)
10. [Phase 4 — AI & Mobile](#10-phase-4--ai--mobile)
11. [Shared Packages](#11-shared-packages)
12. [API Reference Summary](#12-api-reference-summary)
13. [Deployment Guide](#13-deployment-guide)

---

## 1. Project Overview

**GlowHer** is a dual-sided beauty salon booking and management platform targeting Sri Lankan women.

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse services, view stylist profiles, book appointments, pay, earn loyalty points, write reviews |
| **Stylist** | Manage calendar/availability, view upcoming bookings, update profile & portfolio |
| **Admin** | Full control panel — users, services, stylists, orders, promotions, analytics |

**Currency**: LKR (Sri Lankan Rupee)  
**Language**: English (i18n-ready for Sinhala/Tamil in Phase 4)

---

## 2. Recommended Tech Stack

### Frontend — React (Vite)
| Layer | Library | Reason |
|-------|---------|--------|
| Framework | **React 18** + **Vite** | Fast HMR, modern bundler, no SSR overhead for MVP |
| Routing | **React Router v6** | File-like nested routing |
| State (global) | **Zustand** | Minimal boilerplate, works great with React |
| Server state | **TanStack Query v5** | Caching, background refetch, infinite scroll |
| Forms | **React Hook Form** + **Zod** | Type-safe validation |
| UI components | **shadcn/ui** (Radix UI primitives) | Accessible, headless, fully customisable |
| Styling | **Tailwind CSS v3** | Utility-first, design-token friendly |
| Animations | **Framer Motion** | Page transitions, micro-interactions |
| Date handling | **date-fns** | Lightweight date utilities |
| Icons | **Lucide React** | Consistent, tree-shakable |
| Notifications | **Sonner** (toast) | Elegant, Tailwind-ready toasts |
| Charts (admin) | **Recharts** | React-native charts for dashboard |

### Backend — Node.js (Express / Fastify)
| Layer | Library | Reason |
|-------|---------|--------|
| Runtime | **Node.js 20 LTS** | LTS stability, native fetch |
| Framework | **Express.js** | Familiar, huge ecosystem, fast to scaffold |
| ORM | **Prisma** | Type-safe DB client, great DX, migration support |
| Auth | **JWT** (jsonwebtoken) + **bcryptjs** | Stateless auth, role-based |
| Validation | **Zod** | Shared schemas with frontend |
| File uploads | **Multer** + **Cloudinary SDK** | Profile photos, portfolio images |
| Email | **Nodemailer** + **SendGrid** | Transactional email |
| SMS | **Twilio SDK** | Booking reminders (Phase 3) |
| Payments | **Stripe SDK** | Online payments (Phase 2) |
| Task scheduling | **node-cron** | Reminder jobs, cleanup tasks |
| Logging | **Winston** | Structured logs |
| Rate limiting | **express-rate-limit** | API protection |
| CORS | **cors** | Frontend ↔ API communication |

### Why Express over NestJS?
NestJS is powerful but heavyweight for a startup MVP. Express gives you the same power with less ceremony. If the team grows, migrating to NestJS is straightforward since both use the same Node.js ecosystem.

---

## 3. Database Recommendation

### Recommended: **Supabase (PostgreSQL)**

| Feature | Supabase |
|---------|----------|
| Engine | PostgreSQL 15 |
| Hosting | Managed cloud (free tier generous) |
| Real-time | Built-in Postgres Realtime (useful for booking status updates) |
| Auth | Optional (you can use your own JWT — just use Supabase as pure DB) |
| Storage | Built-in S3-compatible storage (alternative to Cloudinary for images) |
| Dashboard | Excellent UI with table editor, SQL editor, logs |
| Prisma support | Full — just set `DATABASE_URL` to Supabase connection string |
| Backups | Daily automated backups (Pro plan) |
| Free tier | 500 MB DB, 1 GB storage, 2 GB bandwidth — enough for MVP |
| Scaling | Vertical scaling + read replicas on Pro |

### Why not Railway or PlanetScale?
- **Railway**: Good but more expensive for always-on projects; no built-in real-time.
- **PlanetScale**: MySQL-based, Prisma relations need workarounds (no FK constraints).
- **Neon**: Excellent PostgreSQL alternative with branching — use if you want git-like DB branches for staging. Second recommendation.

### Schema Notes
- Use `uuid` for all primary keys (Supabase default)
- Use `timestamptz` for all datetime columns (timezone-aware)
- Use `numeric(10,2)` for LKR currency amounts (avoid float precision issues)

---

## 4. Monorepo Structure

```
glowher/
├── apps/
│   ├── web/                    ← React + Vite frontend (port 5173)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/            ← Route-level page components
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (customer)/
│   │   │   │   ├── (stylist)/
│   │   │   │   └── admin/
│   │   │   ├── components/     ← Reusable UI components
│   │   │   │   ├── booking/
│   │   │   │   ├── home/
│   │   │   │   ├── layout/
│   │   │   │   ├── admin/
│   │   │   │   └── ui/         ← shadcn primitives
│   │   │   ├── hooks/          ← Custom React hooks
│   │   │   ├── lib/            ← axios instance, utils, queryClient
│   │   │   ├── store/          ← Zustand stores
│   │   │   ├── types/          ← Frontend-only types
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   └── .env.local
│   │
│   └── api/                    ← Express.js backend (port 3001)
│       ├── src/
│       │   ├── config/         ← env, database, cloudinary config
│       │   ├── middleware/     ← auth, roles, error handler, rate limit
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── services/
│       │   │   ├── stylists/
│       │   │   ├── appointments/
│       │   │   ├── products/   ← Phase 2
│       │   │   ├── orders/     ← Phase 2
│       │   │   ├── promotions/ ← Phase 2
│       │   │   ├── reviews/    ← Phase 3
│       │   │   └── loyalty/    ← Phase 3
│       │   ├── jobs/           ← cron jobs
│       │   ├── lib/            ← mailer, stripe, twilio, cloudinary
│       │   └── index.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── .env
│
└── packages/
    ├── types/                  ← Shared TypeScript interfaces
    │   └── src/index.ts
    └── zod-schemas/            ← Shared Zod validation schemas
        └── src/index.ts
```

---

## 5. Design System

### Color Palette

```css
/* tailwind.config.ts — extend colors */
colors: {
  brand: {
    50:  '#FDF2F6',   /* lightest blush — page backgrounds */
    100: '#FBDFE9',
    200: '#F7BECE',
    300: '#EF8DAD',
    400: '#D4537E',   /* PRIMARY — buttons, links, active states */
    500: '#C23A64',
    600: '#A82C53',
    700: '#8B2244',
    800: '#6E1A35',
    900: '#52122A',   /* darkest — text on light bg */
  },
  gold: {
    300: '#F5D98E',
    400: '#E8C062',   /* accent — badges, stars, highlights */
    500: '#D4A832',
  },
  neutral: {
    /* use slate for most UI neutrals */
  }
}
```

### Typography

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');

:root {
  --font-ui: 'Plus Jakarta Sans', sans-serif;
  --font-display: 'Cormorant Garamond', serif;
}

body { font-family: var(--font-ui); }
h1, h2, .display { font-family: var(--font-display); }
```

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['Plus Jakarta Sans', 'sans-serif'],
  display: ['Cormorant Garamond', 'serif'],
}
```

### Spacing & Radius

```ts
// tailwind.config.ts
borderRadius: {
  'sm': '0.375rem',
  DEFAULT: '0.75rem',
  'lg': '1rem',
  'xl': '1.5rem',
  '2xl': '2rem',
  'pill': '9999px',
}
```

### Shadows

```ts
boxShadow: {
  'card': '0 2px 20px rgba(212, 83, 126, 0.08)',
  'card-hover': '0 8px 40px rgba(212, 83, 126, 0.16)',
  'modal': '0 24px 64px rgba(0,0,0,0.15)',
}
```

### Dark / Light Mode
Use Tailwind `darkMode: 'class'`. Store preference in `localStorage` via a Zustand `useThemeStore`. Default: light.

```ts
// store/theme.ts
const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem('glowher-theme') as Theme) || 'light',
  toggleTheme: () => set((s) => {
    const next = s.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('glowher-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    return { theme: next }
  }),
}))
```

### Animation Tokens (Framer Motion)

```ts
// lib/motion.ts — reusable variants

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* Page transition wrapper */
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: 'easeInOut' },
}
```

### Tailwind Global Utilities

```css
/* globals.css */
@layer utilities {
  .gradient-brand {
    background: linear-gradient(135deg, #D4537E 0%, #E8C062 100%);
  }
  .gradient-hero {
    background: linear-gradient(160deg, #FDF2F6 0%, #FBDFE9 50%, #FFF8F0 100%);
  }
  .text-gradient {
    background: linear-gradient(135deg, #D4537E, #C23A64);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .glass {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.4);
  }
  .glass-dark {
    background: rgba(30,10,20,0.60);
    backdrop-filter: blur(16px);
  }
}
```

---

## 6. Environment Setup

### Prerequisites
- Node.js 20 LTS
- npm 10+ or pnpm 9+
- PostgreSQL (local dev) **or** Supabase account
- Git

### Root `package.json` (workspace)

```json
{
  "name": "glowher",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/api\" \"npm run dev -w apps/web\"",
    "build": "npm run build -w apps/api && npm run build -w apps/web",
    "db:migrate": "npm run migrate -w apps/api",
    "db:studio": "npm run studio -w apps/api"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "typescript": "^5.4.0"
  }
}
```

### `apps/api/.env`

```env
NODE_ENV=development
PORT=3001

# Supabase / PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/glowher?schema=public"

# JWT
JWT_SECRET="min-32-chars-secret-here"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM="noreply@glowher.lk"

# Twilio (Phase 3)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

# Stripe (Phase 2)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### `apps/web/.env.local`

```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=   # Phase 2
```

### Initial Setup Commands

```bash
# Clone & install
git clone <repo-url> glowher
cd glowher
npm install

# Database
cd apps/api
npx prisma generate
npx prisma migrate dev --name init

# Start development
cd ../..
npm run dev
```

---

## 7. Phase 1 — MVP

> **Goal**: Working app where customers can register, browse, and book. Stylists can manage availability. Admins have a basic dashboard.

### 7.1 Prisma Schema (`apps/api/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  STYLIST
  ADMIN
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String?
  name          String
  phone         String?
  avatarUrl     String?
  role          Role     @default(CUSTOMER)
  googleId      String?  @unique
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  stylistProfile StylistProfile?
  appointments   Appointment[]   @relation("CustomerAppointments")
  reviews        Review[]
  loyaltyPoints  LoyaltyPoints?
}

model StylistProfile {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio          String?
  specialities String[]
  experience   Int      @default(0)  // years
  rating       Float    @default(0)
  reviewCount  Int      @default(0)
  portfolioUrls String[]
  isAvailable  Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  availabilities Availability[]
  appointments   Appointment[]  @relation("StylistAppointments")
  services       StylistService[]
}

model ServiceCategory {
  id        String    @id @default(uuid())
  name      String    @unique
  slug      String    @unique
  imageUrl  String?
  order     Int       @default(0)
  services  Service[]
}

model Service {
  id           String          @id @default(uuid())
  categoryId   String
  category     ServiceCategory @relation(fields: [categoryId], references: [id])
  name         String
  slug         String          @unique
  description  String?
  durationMins Int
  basePriceLKR Decimal         @db.Decimal(10, 2)
  imageUrl     String?
  isActive     Boolean         @default(true)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  stylistServices StylistService[]
  appointmentItems AppointmentItem[]
}

model StylistService {
  id        String         @id @default(uuid())
  stylistId String
  stylist   StylistProfile @relation(fields: [stylistId], references: [id])
  serviceId String
  service   Service        @relation(fields: [serviceId], references: [id])
  priceLKR  Decimal        @db.Decimal(10, 2)

  @@unique([stylistId, serviceId])
}

model Availability {
  id          String         @id @default(uuid())
  stylistId   String
  stylist     StylistProfile @relation(fields: [stylistId], references: [id])
  dayOfWeek   Int            // 0=Sun … 6=Sat
  startTime   String         // "09:00"
  endTime     String         // "18:00"
  isActive    Boolean        @default(true)
}

model Appointment {
  id          String            @id @default(uuid())
  customerId  String
  customer    User              @relation("CustomerAppointments", fields: [customerId], references: [id])
  stylistId   String
  stylist     StylistProfile    @relation("StylistAppointments", fields: [stylistId], references: [id])
  startsAt    DateTime
  endsAt      DateTime
  status      AppointmentStatus @default(PENDING)
  totalLKR    Decimal           @db.Decimal(10, 2)
  notes       String?
  cancelReason String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  items AppointmentItem[]
}

model AppointmentItem {
  id            String      @id @default(uuid())
  appointmentId String
  appointment   Appointment @relation(fields: [appointmentId], references: [id])
  serviceId     String
  service       Service     @relation(fields: [serviceId], references: [id])
  priceLKR      Decimal     @db.Decimal(10, 2)
  durationMins  Int
}

model Review {
  id            String   @id @default(uuid())
  customerId    String
  customer      User     @relation(fields: [customerId], references: [id])
  stylistId     String
  appointmentId String   @unique
  rating        Int      // 1-5
  comment       String?
  createdAt     DateTime @default(now())
}

model LoyaltyPoints {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  balance   Int      @default(0)
  updatedAt DateTime @updatedAt

  transactions LoyaltyTransaction[]
}

model LoyaltyTransaction {
  id          String        @id @default(uuid())
  loyaltyId   String
  loyalty     LoyaltyPoints @relation(fields: [loyaltyId], references: [id])
  points      Int
  reason      String
  createdAt   DateTime      @default(now())
}
```

---

### 7.2 Backend — Express App Structure

#### `apps/api/src/index.ts`

```ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { prisma } from './config/database'
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/users/users.routes'
import serviceRoutes from './modules/services/services.routes'
import stylistRoutes from './modules/stylists/stylists.routes'
import appointmentRoutes from './modules/appointments/appointments.routes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/stylists', stylistRoutes)
app.use('/api/appointments', appointmentRoutes)

app.listen(PORT, () => console.log(`API running on :${PORT}`))
```

#### Auth Module (`src/modules/auth/`)

```
auth/
├── auth.routes.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.middleware.ts
```

**auth.service.ts** key methods:
- `register(dto)` — hash password, create user, return JWT
- `login(dto)` — compare hash, return JWT
- `googleCallback(profile)` — upsert user by `googleId`
- `refreshToken(token)` — verify + re-issue

**JWT payload shape**:
```ts
interface JwtPayload {
  sub: string      // userId
  email: string
  role: 'CUSTOMER' | 'STYLIST' | 'ADMIN'
  iat: number
  exp: number
}
```

**auth.middleware.ts**:
```ts
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const authorize = (...roles: Role[]) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
  next()
}
```

---

### 7.3 Frontend — React App

#### `apps/web/src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

#### `apps/web/src/App.tsx` — Route Layout

```tsx
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'
import StylistLayout from './components/layout/StylistLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages (lazy loaded)
const HomePage = lazy(() => import('./app/home/HomePage'))
const LoginPage = lazy(() => import('./app/(auth)/LoginPage'))
const RegisterPage = lazy(() => import('./app/(auth)/RegisterPage'))
const ServicesPage = lazy(() => import('./app/(customer)/ServicesPage'))
const StylistsPage = lazy(() => import('./app/(customer)/StylistsPage'))
const BookPage = lazy(() => import('./app/(customer)/BookPage'))
const ProfilePage = lazy(() => import('./app/(customer)/ProfilePage'))
const AdminDashboard = lazy(() => import('./app/admin/DashboardPage'))
// ... etc

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer */}
          <Route element={<CustomerLayout />}>
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/stylists" element={<StylistsPage />} />
            <Route path="/stylists/:id" element={<StylistDetailPage />} />
            <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
              <Route path="/book" element={<BookPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
            </Route>
          </Route>

          {/* Stylist portal */}
          <Route element={<ProtectedRoute roles={['STYLIST']} />}>
            <Route element={<StylistLayout />}>
              <Route path="/stylist/dashboard" element={<StylistDashboardPage />} />
              <Route path="/stylist/calendar" element={<StylistCalendarPage />} />
              <Route path="/stylist/profile" element={<StylistProfilePage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/stylists" element={<AdminStylistsPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
```

---

### 7.4 Page Designs — Phase 1

#### Home Page (`/`)

**Sections** (top to bottom):
1. `<HeroSection />` — full-width gradient hero, headline in Cormorant Garamond italic, CTA buttons
2. `<CategoriesSection />` — horizontal scroll cards (Hair / Skin / Nails / Makeup / Spa)
3. `<FeaturedServicesSection />` — 3-column grid with service cards
4. `<FeaturedStylistsSection />` — stylist avatar cards with rating stars
5. `<HowItWorksSection />` — 3-step process with icons
6. `<TestimonialsSection />` — carousel with customer reviews
7. `<CTABanner />` — "Book your first appointment" with brand gradient background
8. `<Footer />`

**HeroSection animation**:
```tsx
// Framer Motion sequence
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  <motion.p variants={fadeUp} className="text-brand-400 font-medium tracking-widest uppercase text-sm">
    Sri Lanka's Premier Beauty Platform
  </motion.p>
  <motion.h1 variants={fadeUp} className="font-display text-6xl italic text-neutral-900 mt-2">
    Look Beautiful,<br />Feel Confident
  </motion.h1>
  <motion.p variants={fadeUp} className="text-neutral-600 text-lg mt-4 max-w-md">
    Book top-rated stylists near you. Hair, skin, nails, and beyond.
  </motion.p>
  <motion.div variants={fadeUp} className="flex gap-3 mt-8">
    <Button size="lg" className="gradient-brand text-white rounded-pill px-8">
      Book Now
    </Button>
    <Button size="lg" variant="outline" className="border-brand-400 text-brand-400 rounded-pill px-8">
      Explore Services
    </Button>
  </motion.div>
</motion.div>
```

#### Services Page (`/services`)
- Filter sidebar: category chips, price range slider, duration filter
- Grid of `<ServiceCard />` components
- Each card: image, category badge, name, duration, price (LKR), "Book" button
- Hover: `card-hover` shadow + slight scale via Framer Motion `whileHover={{ scale: 1.02 }}`

#### Stylists Page (`/stylists`)
- Search bar + filter by specialty + sort by rating / experience
- Card grid: avatar, name, specialties tags, star rating, review count, "View Profile" + "Book" buttons
- Empty state with illustrated SVG

#### Stylist Detail Page (`/stylists/:id`)
- Hero: cover photo (glassmorphism overlay with name + rating)
- Tabs: Portfolio | Services | Reviews | Availability
- Book button anchors to booking flow with stylist pre-selected

#### Booking Flow (`/book`) — 4-Step Wizard

```
Step 1: Choose Service    →   Step 2: Choose Stylist
Step 3: Pick Date & Time  →   Step 4: Confirm & Submit
```

**State management** (`store/booking.ts`):
```ts
interface BookingStore {
  step: 1 | 2 | 3 | 4
  selectedServiceIds: string[]
  selectedStylistId: string | null
  selectedDate: Date | null
  selectedTime: string | null
  notes: string
  setStep: (s: number) => void
  // ... setters
  reset: () => void
}
```

**Step transitions**: `slideInRight` Framer Motion variant between steps.

**Step 3 — Calendar UI**:
- Monthly calendar built with `date-fns`
- Disabled past dates + unavailable days (fetched from API)
- Time slots grid (e.g., 09:00, 09:30 … 17:30) — disabled if booked
- Selected slot highlighted with `brand-400` background

#### Auth Pages
- Split layout: left panel = brand image/gradient; right panel = form
- Form with React Hook Form + Zod validation
- Google OAuth button
- Smooth field focus animations (Framer Motion `AnimatePresence` for error messages)

#### Admin Dashboard
- KPI cards: total bookings, revenue (LKR), active stylists, new customers
- Line chart: bookings over 30 days (Recharts `<LineChart />`)
- Pie chart: revenue by service category
- Recent bookings table with status badges
- Quick actions: approve stylist, view pending bookings

---

### 7.5 Zustand Stores

```ts
// store/auth.ts
interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

// store/booking.ts — (shown above)

// store/cart.ts — (Phase 2 — product shop)
```

---

### 7.6 API Hooks (TanStack Query)

```ts
// hooks/useServices.ts
export const useServices = (filters?: ServiceFilters) =>
  useQuery({
    queryKey: ['services', filters],
    queryFn: () => api.get('/services', { params: filters }).then(r => r.data),
  })

// hooks/useStylists.ts
export const useStylists = (params?) =>
  useQuery({ queryKey: ['stylists', params], queryFn: ... })

// hooks/useCreateAppointment.ts
export const useCreateAppointment = () =>
  useMutation({
    mutationFn: (dto: CreateAppointmentDto) => api.post('/appointments', dto).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment booked successfully!')
    },
  })
```

---

## 8. Phase 2 — Payments & Shop

> **Goal**: Customers can pay online for appointments. Product shop with cart and orders.

### 8.1 Additional Prisma Models

```prisma
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
  FAILED
}

model Product {
  id           String   @id @default(uuid())
  name         String
  slug         String   @unique
  description  String?
  priceLKR     Decimal  @db.Decimal(10, 2)
  stock        Int      @default(0)
  imageUrls    String[]
  categoryId   String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  orderItems OrderItem[]
}

model Order {
  id            String      @id @default(uuid())
  customerId    String
  customer      User        @relation(fields: [customerId], references: [id])
  status        OrderStatus @default(PENDING)
  paymentStatus PaymentStatus @default(UNPAID)
  totalLKR      Decimal     @db.Decimal(10, 2)
  stripePaymentIntentId String?
  shippingAddress Json?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  items OrderItem[]
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  priceLKR  Decimal @db.Decimal(10, 2)
}

model Promotion {
  id          String   @id @default(uuid())
  code        String   @unique
  description String?
  type        String   // "PERCENT" | "FIXED"
  value       Decimal  @db.Decimal(10, 2)
  minOrderLKR Decimal? @db.Decimal(10, 2)
  maxUses     Int?
  usedCount   Int      @default(0)
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

// Add to Appointment model:
// stripePaymentIntentId String?
// paymentStatus PaymentStatus @default(UNPAID)
```

### 8.2 Stripe Integration

**Backend** (`src/lib/stripe.ts`):
```ts
import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
```

**Create payment intent** (appointment checkout):
```ts
// appointments.controller.ts — POST /appointments/:id/pay
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(Number(appointment.totalLKR) * 100), // in cents (LKR smallest unit)
  currency: 'lkr',
  metadata: { appointmentId: appointment.id },
})
res.json({ clientSecret: paymentIntent.client_secret })
```

**Webhook** (`POST /api/webhooks/stripe`):
- `payment_intent.succeeded` → update appointment `paymentStatus: PAID`, confirm booking
- `payment_intent.payment_failed` → update `paymentStatus: FAILED`, notify customer

**Frontend** (`@stripe/react-stripe-js`):
```tsx
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <CheckoutForm appointmentId={id} />
</Elements>
```

### 8.3 Product Shop Pages

- `/shop` — product grid with category filter, search, sort
- `/shop/:slug` — product detail with image gallery, add to cart
- `/cart` — cart drawer (Zustand `useCartStore`) with quantity controls
- `/checkout` — address form + Stripe payment element + order summary
- `/orders` — customer order history with status tracking

### 8.4 Admin — Products & Orders

- `/admin/products` — CRUD table with image upload (Cloudinary)
- `/admin/orders` — orders table with status update dropdown
- `/admin/promotions` — create/edit promo codes with usage stats

---

## 9. Phase 3 — Loyalty, Reviews & Notifications

> **Goal**: Engage customers post-booking. Email/SMS reminders. Loyalty points economy.

### 9.1 Loyalty Points System

**Rules** (configure in admin):
- 1 LKR spent = 1 point earned
- 100 points = LKR 10 discount
- Bonus: 500 points on first booking, birthday bonus, referral bonus

**Backend service** (`src/modules/loyalty/loyalty.service.ts`):
```ts
async awardPoints(userId: string, points: number, reason: string) {
  await prisma.loyaltyPoints.upsert({
    where: { userId },
    update: { balance: { increment: points } },
    create: { userId, balance: points },
  })
  await prisma.loyaltyTransaction.create({ data: { ... } })
}

async redeemPoints(userId: string, points: number): Promise<Decimal> {
  // validate balance, deduct, return LKR discount
}
```

**Frontend**:
- Profile page: points balance card, transaction history
- Checkout: "Use X points for LKR Y discount" toggle

### 9.2 Reviews & Ratings

- Only customers who completed an appointment can review
- Review appears on stylist profile + services page
- Admin can hide/flag inappropriate reviews
- After review submission → stylist `rating` recalculated: `avg(reviews.rating)`

### 9.3 Referral Program

- Customer gets unique referral link `/register?ref=CODE`
- Referrer earns 1000 points when referred friend completes first booking
- Track with `referralCode` + `referredBy` on User model

### 9.4 Email Notifications (SendGrid)

| Trigger | Template |
|---------|----------|
| Registration | Welcome + email verification |
| Booking confirmed | Appointment details + calendar invite |
| Booking reminder | 24h before appointment |
| Booking cancelled | Cancellation confirmation |
| Order shipped | Tracking info |
| Points earned | Balance update |

```ts
// lib/mailer.ts
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendBookingConfirmation(to: string, appointment: Appointment) {
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM!,
    templateId: 'd-XXXXX',
    dynamicTemplateData: { appointmentDate: format(appointment.startsAt, 'PPpp') },
  })
}
```

### 9.5 SMS Reminders (Twilio)

```ts
// jobs/reminders.job.ts — runs daily at 09:00
cron.schedule('0 9 * * *', async () => {
  const tomorrow = addDays(new Date(), 1)
  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) },
      status: 'CONFIRMED',
    },
    include: { customer: true },
  })
  for (const apt of appointments) {
    if (apt.customer.phone) {
      await twilioClient.messages.create({
        body: `Hi ${apt.customer.name}! Your GlowHer appointment is tomorrow at ${format(apt.startsAt, 'h:mm a')}. We can't wait to see you! 💄`,
        from: process.env.TWILIO_FROM,
        to: apt.customer.phone,
      })
    }
  }
})
```

### 9.6 New Admin Features

- `/admin/reviews` — moderate reviews, hide/unhide
- `/admin/loyalty` — configure point rules, view leaderboard
- `/admin/notifications` — view sent emails/SMS log
- `/admin/analytics` — extended charts: retention, CLV, referral stats

---

## 10. Phase 4 — AI & Mobile

> **Goal**: Intelligent recommendations. Multi-location. React Native mobile app.

### 10.1 AI Service Recommender

**Approach**: Collaborative filtering (simple) using booking history.

**Backend** (`src/modules/recommendations/`):
```ts
// Simple: recommend services frequently booked together
async getRecommendations(userId: string): Promise<Service[]> {
  const pastServices = await prisma.appointmentItem.findMany({
    where: { appointment: { customerId: userId } },
    select: { serviceId: true },
  })
  // Find other customers who booked same services
  // Return their top services the current user hasn't tried
}
```

**Phase 4.1**: Integrate OpenAI / Anthropic Claude API for:
- Personalized beauty advice chatbot
- "What service is right for me?" quiz → recommendation
- AI-generated care tips after appointment

### 10.2 Multi-Location Support

Add `Location` model to schema:
```prisma
model Location {
  id        String   @id @default(uuid())
  name      String
  address   String
  city      String
  phone     String?
  lat       Float?
  lng       Float?
  isActive  Boolean  @default(true)

  stylists  StylistProfile[]
}
```

- Filter stylists/services by location
- Location picker on home page (detect via browser geolocation)
- Admin: manage multiple locations, assign stylists

### 10.3 React Native Mobile App

**Stack**: React Native (Expo) — code share with web via shared packages.

```
apps/
├── web/       ← existing
├── mobile/    ← Expo React Native
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── navigation/
│       └── store/   ← same Zustand stores (shared via packages/)
```

**Shared code** via `packages/`:
- Zod schemas (validation)
- TypeScript types
- API client hooks (TanStack Query)
- Zustand stores (logic, not UI)

**Mobile-specific**:
- Push notifications via Expo Notifications
- Biometric auth (Face ID / fingerprint)
- Camera for profile photo upload
- Deep linking for booking flow

---

## 11. Shared Packages

### `packages/types/src/index.ts`

```ts
export interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'STYLIST' | 'ADMIN'
  avatarUrl?: string
  phone?: string
}

export interface Service {
  id: string
  name: string
  slug: string
  description?: string
  durationMins: number
  basePriceLKR: string
  imageUrl?: string
  category: ServiceCategory
}

export interface StylistProfile {
  id: string
  userId: string
  user: User
  bio?: string
  specialities: string[]
  experience: number
  rating: number
  reviewCount: number
  portfolioUrls: string[]
  isAvailable: boolean
}

export interface Appointment {
  id: string
  customerId: string
  stylistId: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  totalLKR: string
  items: AppointmentItem[]
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
```

### `packages/zod-schemas/src/index.ts`

```ts
import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const CreateAppointmentSchema = z.object({
  stylistId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).min(1),
  startsAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
})

export const CreateReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})
```

---

## 12. API Reference Summary

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| POST | `/api/auth/google` | — | Google OAuth |
| POST | `/api/auth/refresh` | JWT | Refresh token |
| GET | `/api/auth/me` | JWT | Current user |

### Services
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/services` | — | List services (filter, paginate) |
| GET | `/api/services/:id` | — | Service detail |
| POST | `/api/services` | Admin | Create service |
| PUT | `/api/services/:id` | Admin | Update service |
| DELETE | `/api/services/:id` | Admin | Soft delete service |
| GET | `/api/services/categories` | — | Service categories |

### Stylists
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stylists` | — | List stylists |
| GET | `/api/stylists/:id` | — | Stylist detail |
| GET | `/api/stylists/:id/availability` | — | Available slots |
| PUT | `/api/stylists/profile` | Stylist | Update own profile |
| POST | `/api/stylists/:id/portfolio` | Stylist | Upload portfolio image |

### Appointments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/appointments` | Customer | Create appointment |
| GET | `/api/appointments` | JWT | List (role-filtered) |
| GET | `/api/appointments/:id` | JWT | Detail |
| PATCH | `/api/appointments/:id/cancel` | JWT | Cancel |
| PATCH | `/api/appointments/:id/confirm` | Stylist/Admin | Confirm |
| PATCH | `/api/appointments/:id/complete` | Stylist/Admin | Complete |

### Products & Orders (Phase 2)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | — | List products |
| POST | `/api/orders` | Customer | Create order |
| GET | `/api/orders` | JWT | List orders |
| POST | `/api/orders/:id/pay` | Customer | Create payment intent |
| POST | `/api/webhooks/stripe` | — | Stripe webhook |

### Loyalty & Reviews (Phase 3)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/loyalty/balance` | Customer | Points balance |
| GET | `/api/loyalty/transactions` | Customer | Transaction history |
| POST | `/api/reviews` | Customer | Submit review |
| GET | `/api/reviews/stylist/:id` | — | Stylist reviews |

---

## 13. Deployment Guide

### Infrastructure Recommendation

| Service | Provider | Notes |
|---------|----------|-------|
| Frontend | **Vercel** | Free tier, automatic deploys from Git |
| Backend API | **Railway** or **Render** | Node.js Docker deploy, free tier available |
| Database | **Supabase** | Managed PostgreSQL, free tier |
| File storage | **Cloudinary** | Free 25 GB |
| CDN | Vercel Edge / Cloudflare | Automatic with Vercel |

### Frontend Deploy (Vercel)

```bash
# In apps/web/
vercel --prod

# Environment variables in Vercel dashboard:
VITE_API_URL=https://api.glowher.lk
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Backend Deploy (Railway)

**`apps/api/Dockerfile`**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Railway setup**:
1. Connect GitHub repo
2. Set root directory to `apps/api`
3. Add all environment variables
4. Add start command: `npx prisma migrate deploy && node dist/index.js`

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build -w apps/api
      - name: Deploy to Railway
        run: railway up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build -w apps/web
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Domain Setup
- Register `glowher.lk` (Sri Lanka domain registrar)
- Point `glowher.lk` → Vercel
- Point `api.glowher.lk` → Railway/Render
- SSL: automatic via Vercel + Railway

---

## Quick Reference — Build Order

```
Phase 1 (MVP) — ~8–10 weeks
├── Week 1–2  Monorepo setup, Prisma schema, Express boilerplate
├── Week 3    Auth (register, login, Google OAuth, role guards)
├── Week 4    Services & Categories API + frontend catalogue
├── Week 5    Stylist profiles API + frontend listing/detail
├── Week 6–7  Booking flow (API + 4-step wizard UI)
├── Week 8    Admin dashboard (KPIs, tables, stylist approval)
└── Week 9–10 Polish, testing, deploy

Phase 2 (Payments) — ~4–5 weeks
├── Week 1–2  Stripe integration (appointments + orders)
├── Week 2–3  Product shop (catalogue, cart, checkout)
├── Week 3–4  Promotions & discount codes
└── Week 5    Admin: products, orders management

Phase 3 (Engagement) — ~4–5 weeks
├── Week 1    Loyalty points (earn, redeem, history)
├── Week 2    Reviews & ratings
├── Week 3    Referral program
├── Week 4    Email notifications (SendGrid)
└── Week 5    SMS reminders (Twilio) + notification admin

Phase 4 (AI & Mobile) — ~8–10 weeks
├── Week 1–2  AI recommendations (collaborative filtering)
├── Week 3–4  Chatbot / quiz (Claude API)
├── Week 5    Multi-location support
└── Week 6–10 React Native Expo mobile app
```

---

*GlowHer — Built with love for Sri Lankan women. 🌸*
