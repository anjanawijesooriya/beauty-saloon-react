import { Router } from 'express'
import { z } from 'zod'
import { promotionsController } from './promotions.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const CreateSchema = z.object({
  code:        z.string().min(3).max(20),
  description: z.string().max(200).optional(),
  type:        z.enum(['PERCENT', 'FIXED']),
  value:       z.coerce.number().positive(),
  minOrderLKR: z.coerce.number().optional(),
  maxUses:     z.coerce.number().int().optional(),
  expiresAt:   z.string().datetime().optional(),
})

const router = Router()

router.get('/validate',  authenticate,                                               promotionsController.validate)
router.get('/',          authenticate, authorize('ADMIN'),                           promotionsController.list)
router.post('/',         authenticate, authorize('ADMIN'), validate(CreateSchema),   promotionsController.create)
router.patch('/:id',     authenticate, authorize('ADMIN'),                           promotionsController.update)

export default router
