import { Router } from 'express'
import * as UserController from '../../controllers/user.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { createUserSchema, duplicateUserSchema, editUserSchema, getUserSchema, removeUserSchema } from '../../schemas/user.schema'

const router = Router()

router.get('/get', validateQueryRequest(getUserSchema), UserController.get)
router.post('/create', validateBodyRequest(createUserSchema), UserController.create)
router.post('/edit', validateBodyRequest(editUserSchema), UserController.edit)
router.post('/remove', validateBodyRequest(removeUserSchema), UserController.remove)
router.post('/import', uploadMiddleware({ fieldName: 'file', storageKey: 'import' }), validateUpload('file'), UserController.importHandler)
router.post('/duplicate', validateBodyRequest(duplicateUserSchema), UserController.duplicate)

export default router
