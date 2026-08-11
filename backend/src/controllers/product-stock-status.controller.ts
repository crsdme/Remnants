import type { NextFunction, Response } from 'express'
import type {
  CreateProductStockStatusPayload,
  EditProductStockStatusPayload,
  GetProductStockStatusesPayload,
  RemoveProductStockStatusesPayload,
  ValidatedRequest,
} from '@/types'
import * as ProductStockStatusService from '@/services/product-stock-status.service'

export async function get(
  req: ValidatedRequest<GetProductStockStatusesPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductStockStatusService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateProductStockStatusPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductStockStatusService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditProductStockStatusPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductStockStatusService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveProductStockStatusesPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductStockStatusService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
