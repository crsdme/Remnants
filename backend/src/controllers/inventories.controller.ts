import type { NextFunction, Response } from 'express'
import type {
  CreateInventoriesPayload,
  EditInventoriesPayload,
  GetInventoriesPayload,
  GetInventoryItemsPayload,
  RemoveInventoriesPayload,
  ScanBarcodeToDraftsPayload,
  ValidatedAuthedRequest,
  ValidatedRequest,
} from '@/types'

import * as InventoriesService from '@/services/inventories.service'

export async function get(
  req: ValidatedRequest<GetInventoriesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getItems(
  req: ValidatedRequest<GetInventoryItemsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.getItems({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function scanBarcodeToDraft(
  req: ValidatedRequest<ScanBarcodeToDraftsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.scanBarcodeToDraft({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedAuthedRequest<CreateInventoriesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.create({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditInventoriesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedAuthedRequest<RemoveInventoriesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.remove({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
