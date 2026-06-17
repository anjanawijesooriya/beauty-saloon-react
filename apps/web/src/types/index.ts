export interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'STYLIST' | 'ADMIN'
  avatarUrl?: string
  phone?: string
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  imageUrl?: string
  order: number
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

export interface Availability {
  id: string
  stylistId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED'

export interface AppointmentItem {
  id: string
  serviceId: string
  service: Service
  priceLKR: string
  durationMins: number
}

export interface Appointment {
  id: string
  customerId: string
  customer: { name: string; email: string }
  stylistId: string
  stylist: { user: { name: string } }
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  totalLKR: string
  notes?: string
  cancelReason?: string
  items: AppointmentItem[]
}
