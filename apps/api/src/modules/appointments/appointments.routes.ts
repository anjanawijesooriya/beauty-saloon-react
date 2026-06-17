import { Router } from 'express'
import { z } from 'zod'
import { appointmentsController } from './appointments.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const CreateSchema = z.object({
  stylistId:  z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).min(1, 'Select at least one service'),
  startsAt:   z.string().datetime({ message: 'startsAt must be an ISO datetime string' }),
  notes:      z.string().max(500).optional(),
})

const CancelSchema = z.object({
  reason: z.string().max(200).optional(),
})

const router = Router()

router.use(authenticate)

router.post('/',              authorize('CUSTOMER'),          validate(CreateSchema),  appointmentsController.create)
router.get('/',                                                                        appointmentsController.list)
router.get('/:id',                                                                     appointmentsController.getById)
router.patch('/:id/cancel',                                   validate(CancelSchema),  appointmentsController.cancel)
router.patch('/:id/confirm', authorize('STYLIST', 'ADMIN'),                           appointmentsController.confirm)
router.patch('/:id/complete', authorize('STYLIST', 'ADMIN'),                          appointmentsController.complete)

export default router
