import type { NextFunction, Request, Response } from 'express'
import * as WarehouseTransactionService from '../services/warehouse-transaction.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await WarehouseTransactionService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await WarehouseTransactionService.getItems(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await WarehouseTransactionService.create(req.body, req.user)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await WarehouseTransactionService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await WarehouseTransactionService.remove(req.body, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function receive(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await WarehouseTransactionService.receive(req.body, req.user)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
