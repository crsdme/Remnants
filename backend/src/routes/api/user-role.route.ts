import { Router } from 'express'
import * as UserRoleController from '../../controllers/user-role.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createUserRoleSchema, duplicateUserRoleSchema, editUserRoleSchema, getUserRoleSchema, removeUserRoleSchema } from '../../schemas/user-role.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserRoleSchema),
  UserRoleController.get,
)
router.post(
  '/create',
  checkPermissions('user-role.create'),
  validateBodyRequest(createUserRoleSchema),
  UserRoleController.create,
)
router.post(
  '/edit',
  checkPermissions('user-role.edit'),
  validateBodyRequest(editUserRoleSchema),
  UserRoleController.edit,
)
router.post(
  '/remove',
  checkPermissions('user-role.remove'),
  validateBodyRequest(removeUserRoleSchema),
  UserRoleController.remove,
)
router.post(
  '/import',
  checkPermissions('user-role.import'),
  uploadMiddleware({ fieldName: 'file', storageKey: 'import' }),
  validateUpload('file'),
  UserRoleController.importHandler,
)
router.post(
  '/duplicate',
  checkPermissions('user-role.duplicate'),
  validateBodyRequest(duplicateUserRoleSchema),
  UserRoleController.duplicate,
)

export default router
