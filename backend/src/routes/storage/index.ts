import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import productImages from './products-images'

const router = Router()
const authenticateJWT = authMiddleware()

router.use('/products/images', authenticateJWT, productImages)

export default router
