import { Router } from 'express'
import { loyaltyController } from './loyalty.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/balance',       loyaltyController.getBalance)
router.get('/transactions',  loyaltyController.getTransactions)
router.post('/redeem',       authorize('CUSTOMER'), loyaltyController.redeem)
router.get('/leaderboard',   authorize('ADMIN'),    loyaltyController.leaderboard)

export default router
