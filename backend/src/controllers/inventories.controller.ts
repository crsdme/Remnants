import type { NextFunction, Request, Response } from 'express'
import type { CreateInventoriesInput, EditInventoriesInput, GetInventoriesInput, GetItemsInventoriesInput, RemoveInventoriesInput, ScanBarcodeToDraftInventoriesInput } from '@/types'
import * as InventoriesService from '@/services/inventories.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.get(req.validated?.query as GetInventoriesInput)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.getItems(req.validated?.body as GetItemsInventoriesInput)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function scanBarcodeToDraft(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.scanBarcodeToDraft(req.validated?.body as ScanBarcodeToDraftInventoriesInput)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.create(req.validated?.body as CreateInventoriesInput, req.user)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.edit(req.validated?.body as EditInventoriesInput)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.remove(req.validated?.body as RemoveInventoriesInput, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
