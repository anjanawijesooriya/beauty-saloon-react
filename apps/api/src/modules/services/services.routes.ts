import { Router } from 'express'
import { servicesController } from './services.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()

router.get('/categories', servicesController.listCategories)
router.get('/', servicesController.list)
router.get('/:id', servicesController.getById)
router.post('/', authenticate, authorize('ADMIN'), servicesController.create)
router.put('/:id', authenticate, authorize('ADMIN'), servicesController.update)
router.delete('/:id', authenticate, authorize('ADMIN'), servicesController.softDelete)

export default router
