import { Router } from 'express'
import * as CategoryController from '../controllers/category'
import { validateGetCategories } from '../middleware/validation/'

const router = Router()

router.get('/get', validateGetCategories, CategoryController.get)
router.post('/create', CategoryController.create)
router.post('/edit', CategoryController.edit)
router.post('/remove', CategoryController.remove)

export default router
