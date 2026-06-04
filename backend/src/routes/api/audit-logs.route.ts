import type { RequestHandler } from 'express'
import { getAuditLogsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as AuditLogsController from '@/controllers/audit-logs.controller'
import { validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getAuditLogsSchema),
  AuditLogsController.get as RequestHandler,
)

export default router
