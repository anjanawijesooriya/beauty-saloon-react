import { Router } from 'express'
import { z } from 'zod'
import { stylistsController } from './stylists.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const UpdateProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  specialities: z.array(z.string()).optional(),
  experience: z.number().int().min(0).optional(),
  portfolioUrls: z.array(z.string().url()).optional(),
  isAvailable: z.boolean().optional(),
})

const SetAvailabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
})

const SetServicesSchema = z.object({
  services: z.array(
    z.object({
      serviceId: z.string().uuid(),
      priceLKR: z.number().positive(),
    })
  ),
})

const router = Router()

// ── Stylist portal (static "me" routes must come before /:id) ─────────────
router.get('/me',              authenticate, authorize('STYLIST'), stylistsController.getMyProfile)
router.put('/me/profile',      authenticate, authorize('STYLIST'), validate(UpdateProfileSchema), stylistsController.updateMyProfile)
router.put('/me/availability', authenticate, authorize('STYLIST'), validate(SetAvailabilitySchema), stylistsController.setMyAvailability)
router.put('/me/services',     authenticate, authorize('STYLIST'), validate(SetServicesSchema), stylistsController.setMyServices)

// ── Admin ──────────────────────────────────────────────────────────────────
router.get('/admin/all',       authenticate, authorize('ADMIN'), stylistsController.adminList)
router.post('/admin/profile',  authenticate, authorize('ADMIN'), stylistsController.createProfile)
router.patch('/admin/:id/toggle-availability', authenticate, authorize('ADMIN'), stylistsController.toggleAvailability)

// ── Public ─────────────────────────────────────────────────────────────────
router.get('/',           stylistsController.list)
router.get('/:id',        stylistsController.getById)
router.get('/:id/availability', stylistsController.getAvailability)
router.get('/:id/slots',  stylistsController.getSlots)

export default router
