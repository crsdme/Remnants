import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import authRoutes from './auth.route'
import barcodeRoutes from './barcode.route'
import cashregisterAccountRoutes from './cashregister-account.route'
import cashregisterRoutes from './cashregister.route'
import categoryRoutes from './category.route'
import currencyRoutes from './currency.route'
import languageRoutes from './language.route'
import moneyTransactionRoutes from './money-transaction.route'
import productPropertyGroupRoutes from './product-property-group.route'
import productPropertyOptionRoutes from './product-property-option.route'
import productPropertyRoutes from './product-property.route'
import productRoutes from './product.route'
import settingRoutes from './setting.route'
import unitRoutes from './unit.route'
import userRoleRoutes from './user-role.route'
import userRoutes from './user.route'
import warehouseRoutes from './warehouse.route'

const router = Router()
const authenticateJWT = authMiddleware()

router.use('/auth', authRoutes)
router.use('/currencies', authenticateJWT, currencyRoutes)
router.use('/languages', authenticateJWT, languageRoutes)
router.use('/units', authenticateJWT, unitRoutes)
router.use('/users', authenticateJWT, userRoutes)
router.use('/categories', authenticateJWT, categoryRoutes)
router.use('/user-roles', authenticateJWT, userRoleRoutes)
router.use('/products', authenticateJWT, productRoutes)
router.use('/product-properties-groups', authenticateJWT, productPropertyGroupRoutes)
router.use('/product-properties', authenticateJWT, productPropertyRoutes)
router.use('/product-properties-options', authenticateJWT, productPropertyOptionRoutes)
router.use('/warehouses', authenticateJWT, warehouseRoutes)
router.use('/barcodes', authenticateJWT, barcodeRoutes)
router.use('/money-transactions', authenticateJWT, moneyTransactionRoutes)
router.use('/cashregisters', authenticateJWT, cashregisterRoutes)
router.use('/cashregister-accounts', authenticateJWT, cashregisterAccountRoutes)
router.use('/settings', authenticateJWT, settingRoutes)

export default router
