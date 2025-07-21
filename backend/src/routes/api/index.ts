import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import authRoutes from './auth.route'
import automationRoutes from './automation.route'
import barcodeRoutes from './barcode.route'
import cashregisterAccountRoutes from './cashregister-account.route'
import cashregisterRoutes from './cashregister.route'
import categoryRoutes from './category.route'
import clientRoutes from './client.route'
import currencyRoutes from './currency.route'
import deliveryServiceRoutes from './delivery-service.route'
import languageRoutes from './language.route'
import moneyTransactionRoutes from './money-transaction.route'
import orderPaymentRoutes from './order-payment.route'
import orderSourceRoutes from './order-source.route'
import orderStatusRoutes from './order-status.route'
import orderRoutes from './order.route'
import productPropertyGroupRoutes from './product-property-group.route'
import productPropertyOptionRoutes from './product-property-option.route'
import productPropertyRoutes from './product-property.route'
import productRoutes from './product.route'
import settingRoutes from './setting.route'
import testRoutes from './test.route'
import unitRoutes from './unit.route'
import userRoleRoutes from './user-role.route'
import userRoutes from './user.route'
import warehouseTransactionRoutes from './warehouse-transaction.route'
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
router.use('/order-statuses', authenticateJWT, orderStatusRoutes)
router.use('/order-sources', authenticateJWT, orderSourceRoutes)
router.use('/delivery-services', authenticateJWT, deliveryServiceRoutes)
router.use('/settings', authenticateJWT, settingRoutes)
router.use('/order-payments', authenticateJWT, orderPaymentRoutes)
router.use('/clients', authenticateJWT, clientRoutes)
router.use('/orders', authenticateJWT, orderRoutes)
router.use('/warehouse-transactions', authenticateJWT, warehouseTransactionRoutes)
router.use('/test', authenticateJWT, testRoutes)
router.use('/automations', authenticateJWT, automationRoutes)

export default router
