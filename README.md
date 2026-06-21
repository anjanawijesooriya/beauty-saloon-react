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

## License

MIT
