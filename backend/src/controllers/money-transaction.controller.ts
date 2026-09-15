import type { NextFunction, Response } from 'express'
import type { CancelMoneyTransactionPayload, CreateMoneyTransactionsPayload, CreateMoneyTransactionTransferPayload, GetMoneyTransactionsPayload, ReceiveMoneyTransactionPayload, ValidatedAuthedRequest } from '@/types'
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
  req: ValidatedAuthedRequest<CreateMoneyTransactionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.createTransaction({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function createTransfer(
  req: ValidatedAuthedRequest<CreateMoneyTransactionTransferPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.createTransfer({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function receive(
  req: ValidatedAuthedRequest<ReceiveMoneyTransactionPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.receive({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function cancel(
  req: ValidatedAuthedRequest<CancelMoneyTransactionPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await MoneyTransactionService.cancel({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
