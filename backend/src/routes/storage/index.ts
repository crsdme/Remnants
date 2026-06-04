import { Router } from 'express'
import productImages from './products-images'

const router = Router()

router.use('/products/images', productImages)

export default router
