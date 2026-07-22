import type { NextFunction, Response } from 'express'

import type { CreateWarehousePayload, EditWarehousePayload, GetWarehousesPayload, RemoveWarehousesPayload, ValidatedAuthedRequest, ValidatedRequest } from '@/types/'

import * as WarehouseService from '@/services/warehouse.service'

export async function get(
  req: ValidatedAuthedRequest<GetWarehousesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseService.get({
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
  req: ValidatedRequest<CreateWarehousePayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseService.create({ payload: req.validated.body })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditWarehousePayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseService.edit({ payload: req.validated.body })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveWarehousesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseService.remove({ payload: req.validated.body })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
