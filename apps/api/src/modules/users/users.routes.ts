import { Router } from 'express'
import { usersController } from './users.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', authorize('ADMIN'), usersController.list)
router.get('/:id', authorize('ADMIN'), usersController.getById)
router.put('/me', usersController.updateMe)
router.delete('/:id', authorize('ADMIN'), usersController.deactivate)

export default router
