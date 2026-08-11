import { Router } from 'express'
import expenseFiles from './expenses-files'
import orderFiles from './orders-files'
import productImages from './products-images'

const router = Router()

router.use('/products/images', productImages)
router.use('/orders/files', orderFiles)
router.use('/expenses/files', expenseFiles)

export default router
