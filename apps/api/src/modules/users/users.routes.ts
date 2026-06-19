import { Router } from 'express'
import { usersController } from './users.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', authorize('ADMIN'), usersController.list)
router.get('/:id', authorize('ADMIN'), usersController.getById)
router.put('/me', usersController.updateMe)
router.patch('/:id/toggle-status', authorize('ADMIN'), usersController.toggleStatus)
router.delete('/:id', authorize('ADMIN'), usersController.hardDelete)

export default router
