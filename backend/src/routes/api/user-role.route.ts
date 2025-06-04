import { Router } from 'express'
import * as UserRoleController from '../../controllers/user-role.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { createUserRoleSchema, duplicateUserRoleSchema, editUserRoleSchema, getUserRoleSchema, removeUserRoleSchema } from '../../schemas/user-role.schema'

const router = Router()

router.get('/get', validateQueryRequest(getUserRoleSchema), UserRoleController.get)
router.post('/create', validateBodyRequest(createUserRoleSchema), UserRoleController.create)
router.post('/edit', validateBodyRequest(editUserRoleSchema), UserRoleController.edit)
router.post('/remove', validateBodyRequest(removeUserRoleSchema), UserRoleController.remove)
router.post('/import', uploadMiddleware({ fieldName: 'file', storageKey: 'import' }), validateUpload('file'), UserRoleController.importHandler)
router.post('/duplicate', validateBodyRequest(duplicateUserRoleSchema), UserRoleController.duplicate)

export default router
