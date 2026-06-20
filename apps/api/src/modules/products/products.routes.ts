import { Router } from 'express'
import { z } from 'zod'
import { productsController } from './products.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const imageUrlsField = z.array(z.string().min(1)).optional()

const CreateSchema = z.object({
  name:        z.string().min(2).max(200),
  slug:        z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  description: z.string().max(2000).optional(),
  priceLKR:    z.coerce.number().positive(),
  stock:       z.coerce.number().int().min(0),
  imageUrls:   imageUrlsField,
  categoryId:  z.string().min(1),
})

const UpdateSchema = z.object({
  name:        z.string().min(2).max(200).optional(),
  slug:        z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only').optional(),
  description: z.string().max(2000).optional(),
  priceLKR:    z.coerce.number().positive().optional(),
  stock:       z.coerce.number().int().min(0).optional(),
  imageUrls:   imageUrlsField,
  categoryId:  z.string().min(1).optional(),
})

const router = Router()

router.get('/',                    productsController.list)
router.get('/admin/all',           authenticate, authorize('ADMIN'),                                  productsController.adminList)
router.get('/:slug',               productsController.getBySlug)
router.post('/',                   authenticate, authorize('ADMIN'), validate(CreateSchema),          productsController.create)
router.put('/:id',                 authenticate, authorize('ADMIN'), validate(UpdateSchema),          productsController.update)
router.patch('/:id/toggle-active', authenticate, authorize('ADMIN'),                                  productsController.toggleActive)
router.delete('/:id',              authenticate, authorize('ADMIN'),                                  productsController.remove)

export default router
