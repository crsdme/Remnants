import { Router } from 'express'
import * as UnitController from '../../controllers/unit.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { batchUnitSchema, createUnitSchema, duplicateUnitSchema, editUnitSchema, getUnitSchema, removeUnitSchema } from '../../schemas/unit.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUnitSchema),
  UnitController.get,
)
router.post(
  '/create',
  checkPermissions('unit.create'),
  validateBodyRequest(createUnitSchema),
  UnitController.create,
)
router.post(
  '/edit',
  checkPermissions('unit.edit'),
  validateBodyRequest(editUnitSchema),
  UnitController.edit,
)
router.post(
  '/remove',
  checkPermissions('unit.remove'),
  validateBodyRequest(removeUnitSchema),
  UnitController.remove,
)
router.post(
  '/batch',
  checkPermissions('unit.batch'),
  validateBodyRequest(batchUnitSchema),
  UnitController.batch,
)
router.post(
  '/import',
  checkPermissions('unit.import'),
  uploadMiddleware({ fieldName: 'file', storageKey: 'import' }),
  validateUpload('file'),
  UnitController.importHandler,
)
router.post(
  '/duplicate',
  checkPermissions('unit.duplicate'),
  validateBodyRequest(duplicateUnitSchema),
  UnitController.duplicate,
)

export default router
