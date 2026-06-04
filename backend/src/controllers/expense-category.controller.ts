import type { NextFunction, Response } from 'express'
import type {
  CreateExpenseCategoriesPayload,
  EditExpenseCategoriesPayload,
  GetExpenseCategoriesPayload,
  RemoveExpenseCategoriesPayload,
  ValidatedRequest,
} from '@/types'
import * as ExpenseCategoryService from '@/services/expense-category.service'

export async function get(
  req: ValidatedRequest<GetExpenseCategoriesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseCategoryService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateExpenseCategoriesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseCategoryService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditExpenseCategoriesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseCategoryService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveExpenseCategoriesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ExpenseCategoryService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
