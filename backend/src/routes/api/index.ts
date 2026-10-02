import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'
import auditLogsRoutes from './audit-logs.route'
import authRoutes from './auth.route'
import automationRoutes from './automation.route'
import balanceRoutes from './balance.route'
import barcodeRoutes from './barcode.route'
import cashregisterAccountRoutes from './cashregister-account.route'
import cashregisterRoutes from './cashregister.route'
import categoryRoutes from './category.route'
import clientRoutes from './client.route'
import currencyRoutes from './currency.route'
import deliveryServiceRoutes from './delivery-service.route'
import expenseCategoryRoutes from './expense-category.route'
import expenseRoutes from './expense.route'
import inventoriesRoutes from './inventories.route'
import languageRoutes from './language.route'
import moneyTransactionRoutes from './money-transaction.route'
import orderSourceRoutes from './order-source.route'
import orderStatusRoutes from './order-status.route'
import orderRoutes from './order.route'
import paymentApplicationRoutes from './payment-application.route'
import payrollEntryRoutes from './payroll-entry.route'
import procurementRoutes from './procurement.route'
import productPropertyGroupRoutes from './product-property-group.route'
import productPropertyOptionRoutes from './product-property-option.route'
import productPropertyRoutes from './product-property.route'
import productStockStatusRoutes from './product-stock-status.route'
import productRoutes from './product.route'
import settingRoutes from './setting.route'
import siteRoutes from './site.route'
import statisticRoutes from './statistic.route'
import stockLotRoutes from './stock-lot.route'
import stockMoveRoutes from './stock-move.route'
import supplierRoutes from './supplier.route'
import testRoutes from './test.route'
import unitRoutes from './unit.route'
import userProfileRoutes from './user-profile.route'
import userRoleRoutes from './user-role.route'
import userRoutes from './user.route'
import warehouseTransactionRoutes from './warehouse-transaction.route'
import warehouseRoutes from './warehouse.route'
import workShiftRoutes from './work-shift.route'

const router = Router()
const authenticateJWT = authMiddleware()

router.use('/auth', authRoutes)

router.use(authenticateJWT)
router.use('/sites', siteRoutes)
router.use('/currencies', currencyRoutes)
router.use('/languages', languageRoutes)
router.use('/units', unitRoutes)
router.use('/users', userRoutes)
router.use('/user-profiles', userProfileRoutes)
router.use('/work-shifts', workShiftRoutes)
router.use('/payroll-entries', payrollEntryRoutes)
router.use('/categories', categoryRoutes)
router.use('/user-roles', userRoleRoutes)
router.use('/products', productRoutes)
router.use('/product-properties-groups', productPropertyGroupRoutes)
router.use('/product-properties', productPropertyRoutes)
router.use('/product-properties-options', productPropertyOptionRoutes)
router.use('/warehouses', warehouseRoutes)
router.use('/barcodes', barcodeRoutes)
router.use('/money-transactions', moneyTransactionRoutes)
router.use('/cashregisters', cashregisterRoutes)
router.use('/cashregister-accounts', cashregisterAccountRoutes)
router.use('/order-statuses', orderStatusRoutes)
router.use('/product-stock-statuses', productStockStatusRoutes)
router.use('/order-sources', orderSourceRoutes)
router.use('/delivery-services', deliveryServiceRoutes)
router.use('/settings', settingRoutes)
router.use('/clients', clientRoutes)
router.use('/suppliers', supplierRoutes)
router.use('/orders', orderRoutes)
router.use('/payment-applications', paymentApplicationRoutes)
router.use('/warehouse-transactions', warehouseTransactionRoutes)
router.use('/stock-lots', stockLotRoutes)
router.use('/stock-moves', stockMoveRoutes)
router.use('/test', testRoutes)
router.use('/automations', automationRoutes)
router.use('/expenses', expenseRoutes)
router.use('/expense-categories', expenseCategoryRoutes)
router.use('/inventories', inventoriesRoutes)
router.use('/statistics', statisticRoutes)
router.use('/audit-logs', auditLogsRoutes)
router.use('/procurements', procurementRoutes)
router.use('/balance', balanceRoutes)
export default router
