import type { NextFunction, Response } from 'express'
import type {
  EditWorkShiftPayload,
  FinishWorkShiftPayload,
  PlanWorkShiftPayload,
  StartWorkShiftPayload,
  UnplanWorkShiftPayload,
  ValidatedRequest,
} from '@/types'
import * as WorkShiftService from '@/services/work-shift.service'

export async function start(
  req: ValidatedRequest<StartWorkShiftPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await WorkShiftService.start({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function finish(
  req: ValidatedRequest<FinishWorkShiftPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await WorkShiftService.finish({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditWorkShiftPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await WorkShiftService.edit({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function plan(
  req: ValidatedRequest<PlanWorkShiftPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await WorkShiftService.plan({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function unplan(
  req: ValidatedRequest<UnplanWorkShiftPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await WorkShiftService.unplan({
      payload: req.validated.body,
      user: req.user!,
    })
    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
