import type { NextFunction, Response } from 'express'
import type {
  CreatePayrollEntryPayload,
  RemovePayrollEntriesPayload,
  ValidatedRequest,
} from '@/types'
import * as PayrollEntryService from '@/services/payroll-entry.service'

export async function create(
  req: ValidatedRequest<CreatePayrollEntryPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await PayrollEntryService.create({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemovePayrollEntriesPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await PayrollEntryService.remove({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
