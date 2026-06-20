import { Router } from 'express'
import { usersController } from './users.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { upload } from '../../middleware/upload.middleware'

const router = Router()

router.use(authenticate)

router.get('/', authorize('ADMIN'), usersController.list)
router.put('/me', usersController.updateMe)
router.post('/me/avatar', upload.single('avatar'), usersController.uploadAvatar)
router.delete('/me/avatar', usersController.removeAvatar)
router.get('/:id', authorize('ADMIN'), usersController.getById)
router.patch('/:id/toggle-status', authorize('ADMIN'), usersController.toggleStatus)
router.delete('/:id', authorize('ADMIN'), usersController.hardDelete)

export default router
