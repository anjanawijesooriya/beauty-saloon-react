# GlowHer Salon — Full-Stack Salon Management Platform

GlowHer is a full-stack web application for managing a beauty salon. It covers online booking, an e-commerce shop with Stripe payments, a stylist portal, and a comprehensive admin dashboard — all in one monorepo.

---

## Features

### Customer Portal
- Browse services, stylists, and beauty products
- Book appointments with stylist + time slot selection
- Shop products with cart, promo codes, and Stripe checkout
- Track orders and appointment history
- Loyalty points system and referral codes
- Light / dark mode with full mobile responsiveness

### Stylist Portal
- View upcoming and past appointments
- Manage availability schedule
- Track income and reviews
- Update profile and portfolio images

### Admin Dashboard
- Full user management (activate / deactivate accounts)
- Service and category management with image uploads
- Stylist management and profile control
- Product inventory (stock, active/inactive toggle)
- Order management with Stripe payment details and status updates
- Appointment oversight across all stylists
- Promotion / discount code management
- Review moderation
- Loyalty points management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| State / Data | Zustand, TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Payments | Stripe (Elements + Webhooks) |
| File Uploads | Cloudinary |
| Email | SendGrid / Nodemailer |
| SMS | Twilio |
| Auth | JWT (access + refresh tokens), Google OAuth |
| Monorepo | npm workspaces |

---

## Project Structure

```
glowher/
├── apps/
│   ├── api/                  # Express REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── modules/      # Feature modules (auth, orders, products …)
│   │       ├── middleware/
│   │       ├── config/
│   │       └── lib/
│   └── web/                  # React SPA
│       └── src/
│           ├── app/          # Pages (customer, admin, stylist, auth)
│           ├── components/   # Shared UI components and layouts
│           ├── hooks/        # TanStack Query hooks
│           ├── store/        # Zustand stores (auth, cart, theme)
│           └── types/        # Shared TypeScript types
└── packages/
    ├── types/                # Shared type definitions
    └── zod-schemas/          # Shared validation schemas
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A [Stripe](https://stripe.com) account (test keys are enough to get started)
- A [Cloudinary](https://cloudinary.com) account for image uploads

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/glowher-saloon.git
cd glowher-saloon

# Install all workspace dependencies
npm install
```

### Environment Variables

**`apps/api/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/glowher"

JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@yourdomain.com"

TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

CLIENT_URL="http://localhost:5173"
PORT=3000
```

**`apps/web/.env`**
```env
VITE_API_URL="http://localhost:3000/api"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

> If `STRIPE_SECRET_KEY` is omitted the app runs in **dev payment simulation mode** — orders can be completed without a real Stripe account using a built-in simulated card UI.

### Database Setup

```bash
# Run migrations
npm run db:migrate

# (Optional) Seed with demo data
npm run -w apps/api seed

# Open Prisma Studio
npm run db:studio
```

### Running Locally

```bash
# Start both API and web in parallel
npm run dev
```

| Service | URL |
|---|---|
| Web app | http://localhost:5173 |
| API | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 |

---

## Stripe Webhook (Local Development)

To receive webhook events locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will print a `whsec_...` secret — set this as `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`.

---

## Data Models

```
User ──< Appointment >── StylistProfile ──< StylistService >── Service
User ──< Order >──< OrderItem >── Product
User ──< Review
User ── LoyaltyPoints ──< LoyaltyTransaction
Service ──< ServiceCategory
Appointment ──< AppointmentItem
Promotion (standalone — applied at checkout)
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start API + web in development mode |
| `npm run build` | Build both apps for production |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

---

## Deployment

Recommended free-tier stack:

| Service | Provider | Free tier |
|---|---|---|
| PostgreSQL database | [Neon](https://neon.tech) | 0.5 GB, always-on |
| REST API (Node.js) | [Render](https://render.com) | 750 hrs/month (sleeps after 15 min idle) |
| React frontend | [Vercel](https://vercel.com) | Unlimited for hobby projects |

> **Render free tier caveat** — the service spins down after 15 minutes of inactivity and takes ~30 seconds to wake up on the next request. Upgrade to the $7/month Starter plan for an always-on API in production.

---

### Step 1 — Database on Neon

1. Sign up at [neon.tech](https://neon.tech) → **New Project** → name it `glowher`.
2. Choose the region closest to your users (e.g. `AWS ap-southeast-1` for Sri Lanka).
3. Copy the **Connection string** from the dashboard. It looks like:
   ```
   postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/glowher?sslmode=require
   ```
4. Save this as `DATABASE_URL` — you will need it in Step 2.

---

### Step 2 — API on Render

1. Push the repository to GitHub.
2. Sign up at [render.com](https://render.com) → **New** → **Web Service** → connect your GitHub repo.
3. Configure the service:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `apps/api` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npx prisma generate && npm run build` |
   | **Start Command** | `bash render-start.sh` |

4. Under **Environment Variables**, add every key from the table below:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon connection string from Step 1 |
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `JWT_SECRET` | A long random string (use `openssl rand -hex 32`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | Your Vercel URL — add after Step 3 (e.g. `https://glowher.vercel.app`) |
   | `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` |
   | `STRIPE_WEBHOOK_SECRET` | Add after Step 4 |
   | `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
   | `SMTP_HOST` | e.g. `smtp.sendgrid.net` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `apikey` (SendGrid) or your email |
   | `SMTP_PASS` | Your SMTP password / API key |
   | `SMTP_FROM` | `GlowHer <noreply@yourdomain.com>` |
   | `TWILIO_ACCOUNT_SID` | From Twilio console (optional) |
   | `TWILIO_AUTH_TOKEN` | From Twilio console (optional) |
   | `TWILIO_FROM` | Your Twilio number (optional) |

5. Click **Create Web Service**. Render will build and deploy.
6. Note your API URL — it will be `https://glowher-api.onrender.com` (or similar).

---

### Step 3 — Frontend on Vercel

1. Sign up at [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
2. Configure the project:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `apps/web` |
   | **Framework Preset** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://glowher-api.onrender.com/api` (your Render URL + `/api`) |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` |

4. Click **Deploy**.
5. Copy your Vercel URL (e.g. `https://glowher.vercel.app`).
6. Go back to Render → your API service → **Environment** → update `CLIENT_URL` to your Vercel URL → **Save** (Render will redeploy automatically).

---

### Step 4 — Stripe Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add endpoint**.
3. Set the URL to:
   ```
   https://glowher-api.onrender.com/api/webhooks/stripe
   ```
4. Under **Events to listen to**, select:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint** → reveal the **Signing secret** (`whsec_...`).
6. Go to Render → your API service → **Environment** → add `STRIPE_WEBHOOK_SECRET` → **Save**.

---

### Step 5 — Verify the Deployment

Run through this checklist after all three services are live:

- [ ] Visit your Vercel URL — homepage loads correctly
- [ ] Register a new customer account
- [ ] Browse the shop and add a product to cart
- [ ] Complete checkout using a Stripe test card (`4242 4242 4242 4242`, any future date, any CVC)
- [ ] Confirm the order appears as **PAID** in the customer order history and the admin Orders page
- [ ] Log in as admin (`/login`) and verify all dashboard sections load
- [ ] Upload a product image — confirm it appears (Cloudinary)

---

### Useful Commands

```bash
# Run production migrations manually (if needed)
cd apps/api
DATABASE_URL="<your-neon-url>" npx prisma migrate deploy

# Check Render logs
# Render Dashboard → your service → Logs tab

# Check Vercel build logs
# Vercel Dashboard → your project → Deployments → click a deployment
```

---

## License

MIT
