import { Router } from 'express'
import * as AuditLogsController from '../../controllers/audit-logs.controller'
import { validateQueryRequest } from '../../middleware/'
import { getAuditLogsSchema } from '../../schemas/audit-logs.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getAuditLogsSchema),
  AuditLogsController.get,
)

export default router
