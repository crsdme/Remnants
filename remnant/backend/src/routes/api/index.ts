import { Router } from 'express'
import { getAuthMiddleware } from '../../middleware/auth.middleware'
import authRoutes from './auth.route'
import currencyRoutes from './currency.route'
import languageRoutes from './language.route'

const router = Router()
const authenticateJWT = getAuthMiddleware()

router.use('/auth', authRoutes)
router.use('/currencies', authenticateJWT, currencyRoutes)
router.use('/languages', authenticateJWT, languageRoutes)

export default router
