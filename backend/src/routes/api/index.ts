import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import authRoutes from './auth.route'
import categoryRoutes from './category.route'
import currencyRoutes from './currency.route'
import languageRoutes from './language.route'
import unitRoutes from './unit.route'
import userRoleRoutes from './user-role.route'
import userRoutes from './user.route'

const router = Router()
const authenticateJWT = authMiddleware()

router.use('/auth', authRoutes)
router.use('/currencies', authenticateJWT, currencyRoutes)
router.use('/languages', authenticateJWT, languageRoutes)
router.use('/units', authenticateJWT, unitRoutes)
router.use('/users', authenticateJWT, userRoutes)
router.use('/categories', authenticateJWT, categoryRoutes)
router.use('/user-roles', authenticateJWT, userRoleRoutes)

export default router
