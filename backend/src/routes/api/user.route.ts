import { Router } from 'express'
import * as UserController from '../../controllers/user.controller'
import { uploadSingle, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { createUserSchema, duplicateUserSchema, editUserSchema, getUserSchema, removeUserSchema } from '../../schemas/user.schema'

const router = Router()

router.get('/get', validateQueryRequest(getUserSchema), UserController.get)
router.post('/create', validateBodyRequest(createUserSchema), UserController.create)
router.post('/edit', validateBodyRequest(editUserSchema), UserController.edit)
router.post('/remove', validateBodyRequest(removeUserSchema), UserController.remove)
router.post('/import', uploadSingle('file'), validateUpload('file'), UserController.upload)
router.post('/duplicate', validateBodyRequest(duplicateUserSchema), UserController.duplicate)

export default router
