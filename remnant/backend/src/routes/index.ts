import { Router } from 'express'
import { authenticateJWT } from '../middleware/auth.middleware'
import authRoutes from './auth'
import categoriesRoutes from './category'
import currencyRoutes from './currency'
import languageRoutes from './language'
import productRoutes from './product'
import unitsRoutes from './unit'

const router = Router()

router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/languages', authenticateJWT, languageRoutes)
router.use('/units', authenticateJWT, unitsRoutes)
router.use('/currencies', authenticateJWT, currencyRoutes)
router.use('/categories', authenticateJWT, categoriesRoutes)

export default router
