import type { NextFunction, Request, Response } from 'express'
import * as InventoriesService from '../services/inventories.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.getItems(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function scanBarcodeToDraft(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.scanBarcodeToDraft(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.create(req.body, req.user)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await InventoriesService.remove(req.body, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
