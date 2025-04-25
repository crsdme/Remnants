import { Router } from 'express'
import * as ProductController from '../controllers/product'
import { validateGetProduct } from '../middleware/validation/'

const router = Router()

// router.post("/create", validateLogin, AuthController.login);
router.post('/get', validateGetProduct, ProductController.get)
// router.post("/edit", validateRegister, AuthController.register);

export default router
