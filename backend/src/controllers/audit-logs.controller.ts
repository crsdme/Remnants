import type { NextFunction, Response } from 'express'
import type { GetAuditLogsPayload, ValidatedRequest } from '@/types'
import * as AuditLogsService from '@/services/audit-logs.service'

export async function get(
  req: ValidatedRequest<GetAuditLogsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await AuditLogsService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
