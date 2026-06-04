import type { NextFunction, Response } from 'express'
import type { CreateCashregisterPayload, EditCashregisterPayload, GetCashregistersPayload, RemoveCashregistersPayload, ValidatedRequest } from '@/types'
import * as CashregisterService from '@/services/cashregister.service'

export async function get(
  req: ValidatedRequest<GetCashregistersPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateCashregisterPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditCashregisterPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveCashregistersPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
