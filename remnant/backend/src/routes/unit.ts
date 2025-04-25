import { Router } from 'express'
import * as UnitController from '../controllers/unit'
import { validateGetUnits } from '../middleware/validation/'

const router = Router()

router.get('/get', validateGetUnits, UnitController.get)
router.post('/create', UnitController.create)
router.post('/edit', UnitController.edit)
router.post('/remove', UnitController.remove)

export default router
