import type { NextFunction, Response } from 'express'
import type { CreateMoneyTransactionsPayload, CreateMoneyTransactionTransferPayload, GetMoneyTransactionsPayload, ValidatedAuthedRequest, ValidatedRequest } from '@/types'
import * as MoneyTransactionService from '@/services/money-transaction.service'

export async function get(
  req: ValidatedAuthedRequest<GetMoneyTransactionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.get({
      payload: req.validated.query,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function createTransaction(
  req: ValidatedRequest<CreateMoneyTransactionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.createTransaction({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function createTransfer(
  req: ValidatedRequest<CreateMoneyTransactionTransferPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.createTransfer({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
