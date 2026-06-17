import { Router } from 'express'
import { appointmentsController } from './appointments.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.post('/', authorize('CUSTOMER'), appointmentsController.create)
router.get('/', appointmentsController.list)
router.get('/:id', appointmentsController.getById)
router.patch('/:id/cancel', appointmentsController.cancel)
router.patch('/:id/confirm', authorize('STYLIST', 'ADMIN'), appointmentsController.confirm)
router.patch('/:id/complete', authorize('STYLIST', 'ADMIN'), appointmentsController.complete)

export default router
