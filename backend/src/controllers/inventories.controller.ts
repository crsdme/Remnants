import type { NextFunction, Response } from 'express'
import type {
  ConfirmInventoryPayload,
  CreateInventoriesPayload,
  EditInventoriesPayload,
  ExportInventoryPayload,
  GetInventoriesPayload,
  GetInventoryItemsPayload,
  GetInventoryProgressPayload,
  RemoveInventoriesPayload,
  ScanBarcodeToDraftsPayload,
  UpsertInventoryItemPayload,
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

export async function getProgress(
  req: ValidatedRequest<GetInventoryProgressPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.getProgress({
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

export async function upsertItem(
  req: ValidatedRequest<UpsertInventoryItemPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.upsertItem({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function confirm(
  req: ValidatedAuthedRequest<ConfirmInventoryPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.confirm({
      payload: req.validated.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
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

export async function exportExcel(
  req: ValidatedRequest<ExportInventoryPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await InventoriesService.exportExcel({
      payload: req.validated.body,
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${serviceResponse.filename}"`)
    res.setHeader('X-Export-Code', serviceResponse.code)
    res.setHeader('X-Export-Message', serviceResponse.message ?? '')
    res.setHeader('X-Export-Filename', serviceResponse.filename)
    res.setHeader('Access-Control-Expose-Headers', 'x-export-code, x-export-message, x-export-filename, content-disposition')
    res.send(serviceResponse.buffer)
  }
  catch (err) {
    next(err)
  }
}
