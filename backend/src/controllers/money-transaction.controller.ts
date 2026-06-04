import type { NextFunction, Request, Response } from 'express'
import type { CreateMoneyTransactionsPayload, GetMoneyTransactionsPayload, ValidatedRequest } from '@/types'
import * as MoneyTransactionService from '@/services/money-transaction.service'

export async function get(
  req: ValidatedRequest<GetMoneyTransactionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateMoneyTransactionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
