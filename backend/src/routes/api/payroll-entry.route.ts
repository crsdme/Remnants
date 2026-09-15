import type { RequestHandler } from 'express'
import {
  createPayrollEntryResponseSchema,
  createPayrollEntrySchema,
  removePayrollEntriesResponseSchema,
  removePayrollEntriesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as PayrollEntryController from '@/controllers/payroll-entry.controller'
import { checkPermissions, validateBodyRequest, validateResponse } from '@/middleware'

const router = Router()

router.post(
  '/create',
  validateBodyRequest(createPayrollEntrySchema),
  checkPermissions('userProfile.edit'),
  validateResponse(createPayrollEntryResponseSchema),
  PayrollEntryController.create as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removePayrollEntriesSchema),
  checkPermissions('userProfile.edit'),
  validateResponse(removePayrollEntriesResponseSchema),
  PayrollEntryController.remove as RequestHandler,
)

export default router
