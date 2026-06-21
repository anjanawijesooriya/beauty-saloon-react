import { Router } from 'express'
import { z } from 'zod'
import { servicesController } from './services.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const CreateCategorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  imageUrl: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
})

const CreateServiceSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  durationMins: z.number().int().min(15).max(480),
  basePriceLKR: z.number().positive(),
  imageUrl: z.string().url().optional(),
})

const UpdateServiceSchema = CreateServiceSchema.partial().omit({ slug: true })

const router = Router()

// Categories (public read, admin write)
router.get('/categories', servicesController.listCategories)
router.post('/categories', authenticate, authorize('ADMIN'), validate(CreateCategorySchema), servicesController.createCategory)
router.put('/categories/:id', authenticate, authorize('ADMIN'), validate(CreateCategorySchema.partial()), servicesController.updateCategory)
router.delete('/categories/:id', authenticate, authorize('ADMIN'), servicesController.deleteCategory)

// Services (public read, admin write)
router.get('/', servicesController.list)
router.get('/:id', servicesController.getById)
router.post('/', authenticate, authorize('ADMIN'), validate(CreateServiceSchema), servicesController.create)
router.put('/:id', authenticate, authorize('ADMIN'), validate(UpdateServiceSchema), servicesController.update)
router.delete('/:id', authenticate, authorize('ADMIN'), servicesController.softDelete)

export default router
