import type { NextFunction, Response } from 'express'
import type { CreateExpensePayload, EditExpensePayload, GetExpensesPayload, RemoveExpensesPayload, ValidatedAuthedRequest, ValidatedRequest } from '@/types'
import * as ExpenseService from '@/services/expense.service'

export async function get(
  req: ValidatedAuthedRequest<GetExpensesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseService.get({
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
  req: ValidatedRequest<never, CreateExpensePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditExpensePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveExpensesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
