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

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().optional(),
})

export const CreateReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export const CreateServiceSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional(),
  durationMins: z.number().int().min(15),
  basePriceLKR: z.number().positive(),
  imageUrl: z.string().url().optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>
