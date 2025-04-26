import { Router } from 'express'
import * as LanguageController from '../../controllers/language.controller'
import { validateQueryRequest } from '../../middleware/'
import { getLanguageSchema } from '../../schemas/language.schema'

const router = Router()

router.get('/get', validateQueryRequest(getLanguageSchema), LanguageController.get)

export default router
