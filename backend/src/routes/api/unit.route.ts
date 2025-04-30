import { Router } from 'express'
import * as UnitController from '../../controllers/unit.controller'
import { uploadSingle, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { batchUnitSchema, createUnitSchema, duplicateUnitSchema, editUnitSchema, getUnitSchema, removeUnitSchema } from '../../schemas/unit.schema'

const router = Router()

router.get('/get', validateQueryRequest(getUnitSchema), UnitController.get)
router.post('/create', validateBodyRequest(createUnitSchema), UnitController.create)
router.post('/edit', validateBodyRequest(editUnitSchema), UnitController.edit)
router.post('/remove', validateBodyRequest(removeUnitSchema), UnitController.remove)
router.post('/batch', validateBodyRequest(batchUnitSchema), UnitController.batch)
router.post('/import', uploadSingle('file'), validateUpload('file'), UnitController.upload)
router.post('/duplicate', validateBodyRequest(duplicateUnitSchema), UnitController.duplicate)

export default router
