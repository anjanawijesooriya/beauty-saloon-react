import { Router } from 'express'
import { z } from 'zod'
import { reviewsController } from './reviews.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const CreateSchema = z.object({
  appointmentId: z.string().uuid(),
  stylistId:     z.string().uuid(),
  rating:        z.coerce.number().int().min(1).max(5),
  comment:       z.string().max(1000).optional(),
})

const router = Router()

router.get('/stylist/:stylistId',  reviewsController.byStylist)
router.get('/admin/all',           authenticate, authorize('ADMIN'), reviewsController.adminList)
router.patch('/admin/:id/toggle',  authenticate, authorize('ADMIN'), reviewsController.toggleHide)
router.post('/',                   authenticate, authorize('CUSTOMER'), validate(CreateSchema), reviewsController.create)

export default router
