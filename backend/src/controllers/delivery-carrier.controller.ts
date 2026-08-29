import type { NextFunction, Response } from 'express'
import type {
  GetDeliveryCapabilitiesPayload,
  GetDeliveryLocationsPayload,
  LookupDeliveryShipmentPayload,
  ValidatedRequest,
} from '@/types'
import * as DeliveryCarrierService from '@/services/delivery-carrier.service'

export async function getCapabilities(
  req: ValidatedRequest<GetDeliveryCapabilitiesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await DeliveryCarrierService.getCapabilities({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getLocations(
  req: ValidatedRequest<never, GetDeliveryLocationsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await DeliveryCarrierService.getLocations({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function lookupShipment(
  req: ValidatedRequest<never, LookupDeliveryShipmentPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await DeliveryCarrierService.lookupShipment({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
