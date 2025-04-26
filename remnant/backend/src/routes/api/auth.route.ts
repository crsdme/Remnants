import { Router } from 'express'
import * as AuthController from '../../controllers/auth.controller'
import { refreshJWT, validateBodyRequest } from '../../middleware'
import { loginSchema } from '../../schemas/auth.schema'

const router = Router()

router.post('/login', validateBodyRequest(loginSchema), AuthController.login)
router.post('/refresh', refreshJWT, AuthController.refresh)
router.post('/logout', AuthController.logout)

export default router
