import type { NextFunction, Response } from 'express'
import type {
  CreateOrderPaymentsPayload,
  EditOrderPaymentsPayload,
  GetOrderPaymentsPayload,
  RemoveOrderPaymentsPayload,
  ValidatedRequest,
} from '@/types'

import * as OrderPaymentService from '@/services/order-payment.service'

export async function get(
  req: ValidatedRequest<GetOrderPaymentsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderPaymentService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateOrderPaymentsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderPaymentService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditOrderPaymentsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderPaymentService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveOrderPaymentsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderPaymentService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
