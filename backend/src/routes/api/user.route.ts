import { Router } from 'express'
import * as UserController from '../../controllers/user.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createUserSchema, duplicateUserSchema, editUserSchema, getUserSchema, removeUserSchema } from '../../schemas/user.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserSchema),
  UserController.get,
)
router.post(
  '/create',
  checkPermissions('user.create'),
  validateBodyRequest(createUserSchema),
  UserController.create,
)
router.post(
  '/edit',
  checkPermissions('user.edit'),
  validateBodyRequest(editUserSchema),
  UserController.edit,
)
router.post(
  '/remove',
  checkPermissions('user.remove'),
  validateBodyRequest(removeUserSchema),
  UserController.remove,
)
router.post(
  '/import',
  uploadMiddleware({ fieldName: 'file', storageKey: 'import' }),
  validateUpload('file'),
  checkPermissions('user.import'),
  UserController.importHandler,
)
router.post(
  '/duplicate',
  validateBodyRequest(duplicateUserSchema),
  checkPermissions('user.duplicate'),
  UserController.duplicate,
)

export default router
