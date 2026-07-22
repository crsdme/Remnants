import type { NextFunction, Response } from 'express'
import type {
  CreateDeliveryServicesPayload,
  EditDeliveryServicesPayload,
  GetDeliveryServicesPayload,
  RemoveDeliveryServicesPayload,
  ValidatedAuthedRequest,
  ValidatedRequest,
} from '@/types'
import * as DeliveryServiceService from '@/services/delivery-service.service'

export async function get(
  req: ValidatedAuthedRequest<GetDeliveryServicesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await DeliveryServiceService.get({
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
  req: ValidatedRequest<never, CreateDeliveryServicesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await DeliveryServiceService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditDeliveryServicesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await DeliveryServiceService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveDeliveryServicesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await DeliveryServiceService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
