import type { NextFunction, Response } from 'express'
import type {
  CreateOrderStatusPayload,
  EditOrderStatusPayload,
  GetOrderStatusesPayload,
  RemoveOrderStatusesPayload,
  ValidatedAuthedRequest,
  ValidatedRequest,
} from '@/types'
import * as OrderStatusService from '@/services/order-status.service'

export async function get(
  req: ValidatedAuthedRequest<GetOrderStatusesPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderStatusService.get({
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
  req: ValidatedRequest<CreateOrderStatusPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderStatusService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditOrderStatusPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderStatusService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveOrderStatusesPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderStatusService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
