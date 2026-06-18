import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import authRoutes        from './modules/auth/auth.routes'
import userRoutes        from './modules/users/users.routes'
import serviceRoutes     from './modules/services/services.routes'
import stylistRoutes     from './modules/stylists/stylists.routes'
import appointmentRoutes from './modules/appointments/appointments.routes'
import productRoutes     from './modules/products/products.routes'
import orderRoutes       from './modules/orders/orders.routes'
import promotionRoutes   from './modules/promotions/promotions.routes'
import webhookRoutes     from './modules/webhooks/webhooks.routes'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))

// Raw body for Stripe webhook — must come before express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/auth',         authRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/services',     serviceRoutes)
app.use('/api/stylists',     stylistRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/products',     productRoutes)
app.use('/api/orders',       orderRoutes)
app.use('/api/promotions',   promotionRoutes)

app.use(errorHandler)

app.listen(env.PORT, () => console.log(`GlowHer API running on :${env.PORT}`))
