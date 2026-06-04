import type { NextFunction, Response } from 'express'
import type { CreateCashregisterAccountPayload, EditCashregisterAccountPayload, GetCashregisterAccountsPayload, RemoveCashregisterAccountsPayload, ValidatedRequest } from '@/types'
import * as CashregisterAccountService from '@/services/cashregister-account.service'

export async function get(
  req: ValidatedRequest<GetCashregisterAccountsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterAccountService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateCashregisterAccountPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterAccountService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditCashregisterAccountPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterAccountService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveCashregisterAccountsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CashregisterAccountService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
