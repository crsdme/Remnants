import type { NextFunction, Response } from 'express'
import type {
  CreateProductPropertyOptionPayload,
  EditProductPropertyOptionPayload,
  GetProductPropertyOptionsPayload,
  RemoveProductPropertyOptionsPayload,
  ValidatedRequest,
} from '@/types'
import * as ProductPropertyOptionService from '@/services/product-property-option.service'

export async function get(
  req: ValidatedRequest<GetProductPropertyOptionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductPropertyOptionService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateProductPropertyOptionPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductPropertyOptionService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditProductPropertyOptionPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductPropertyOptionService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveProductPropertyOptionsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductPropertyOptionService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
