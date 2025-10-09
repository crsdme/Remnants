import type { NextFunction, Request, Response } from 'express'
import * as AuditLogsService from '../services/audit-logs.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await AuditLogsService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
