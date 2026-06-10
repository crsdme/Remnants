import type { NextFunction, Response } from 'express'
import type {
  CreateBalancesPayload,
  GetBalancesPayload,
  GetCurrentBalancePayload,
  RemoveBalancesPayload,
  ValidatedAuthedRequest,
  ValidatedRequest,
} from '@/types'
import * as BalanceService from '@/services/balance.service'

export async function get(
  req: ValidatedRequest<GetBalancesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BalanceService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getCurrent(
  req: ValidatedAuthedRequest<GetCurrentBalancePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BalanceService.getCurrent({
      payload: req.validated.query,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedAuthedRequest<never, CreateBalancesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BalanceService.create({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveBalancesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BalanceService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
