import type { NextFunction, Response } from 'express'
import type {
  CreateOrderSourcePayload,
  EditOrderSourcePayload,
  GetOrderSourcesPayload,
  RemoveOrderSourcesPayload,
  ValidatedAuthedRequest,
  ValidatedRequest,
} from '@/types'
import * as OrderSourceService from '@/services/order-source.service'

export async function get(
  req: ValidatedAuthedRequest<GetOrderSourcesPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderSourceService.get({
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
  req: ValidatedRequest<CreateOrderSourcePayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderSourceService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditOrderSourcePayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderSourceService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveOrderSourcesPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await OrderSourceService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
