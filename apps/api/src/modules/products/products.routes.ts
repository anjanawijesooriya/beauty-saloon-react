import { Router } from 'express'
import { z } from 'zod'
import { productsController } from './products.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const CreateSchema = z.object({
  name:        z.string().min(2).max(200),
  slug:        z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  description: z.string().max(2000).optional(),
  priceLKR:    z.coerce.number().positive(),
  stock:       z.coerce.number().int().min(0),
  imageUrls:   z.array(z.string().url()).optional(),
  categoryId:  z.string().min(1),
})

const router = Router()

router.get('/',         productsController.list)
router.get('/:slug',    productsController.getBySlug)

router.post('/',        authenticate, authorize('ADMIN'), validate(CreateSchema),           productsController.create)
router.put('/:id',      authenticate, authorize('ADMIN'),                                   productsController.update)
router.delete('/:id',   authenticate, authorize('ADMIN'),                                   productsController.remove)

export default router
