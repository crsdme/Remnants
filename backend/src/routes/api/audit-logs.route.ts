import type { RequestHandler } from 'express'
import { getAuditLogsResponseSchema, getAuditLogsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as AuditLogsController from '@/controllers/audit-logs.controller'
import { validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getAuditLogsSchema),
  validateResponse(getAuditLogsResponseSchema),
  AuditLogsController.get as RequestHandler,
)

export default router
