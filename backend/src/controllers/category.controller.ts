import type { NextFunction, Response } from 'express'
import type { CreateCategoryPayload, EditCategoryPayload, GetCategoriesPayload, RemoveCategoriesPayload, ValidatedRequest } from '@/types'
import * as CategoryService from '@/services/category.service'

export async function get(
  req: ValidatedRequest<GetCategoriesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CategoryService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateCategoryPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CategoryService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditCategoryPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CategoryService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveCategoriesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CategoryService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
