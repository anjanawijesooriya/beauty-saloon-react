import { Router } from 'express'
import { z } from 'zod'
import { ordersController } from './orders.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const ShippingAddressSchema = z.object({
  fullName:     z.string().min(2),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city:         z.string().min(2),
  phone:        z.string().min(9),
})

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity:  z.coerce.number().int().positive(),
  })).min(1, 'Cart cannot be empty'),
  promoCode:       z.string().optional(),
  shippingAddress: ShippingAddressSchema,
})

const router = Router()

router.use(authenticate)

router.get('/admin/all',           authorize('ADMIN'), ordersController.adminList)
router.patch('/admin/:id/status',  authorize('ADMIN'), ordersController.adminUpdateStatus)
router.delete('/admin/:id',        authorize('ADMIN'), ordersController.adminDelete)
router.post('/',                authorize('CUSTOMER'), validate(CreateOrderSchema),   ordersController.create)
router.get('/',                                                                        ordersController.list)
router.get('/:id',                                                                     ordersController.getById)
router.post('/:id/pay',          authorize('CUSTOMER'),                               ordersController.pay)
router.post('/:id/pay/verify',   authorize('CUSTOMER'),                               ordersController.verifyPayment)
router.post('/:id/pay/simulate', authorize('CUSTOMER'),                               ordersController.simulatePaymentDev)

export default router
