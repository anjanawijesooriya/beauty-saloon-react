import { Router } from 'express'
import { stylistsController } from './stylists.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', stylistsController.list)
router.get('/:id', stylistsController.getById)
router.get('/:id/availability', stylistsController.getAvailability)
router.put('/profile', authenticate, authorize('STYLIST'), stylistsController.updateProfile)
router.put('/availability', authenticate, authorize('STYLIST'), stylistsController.setAvailability)

export default router
