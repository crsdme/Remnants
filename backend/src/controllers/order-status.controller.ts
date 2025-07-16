import type { NextFunction, Request, Response } from 'express'
import * as OrderStatusService from '../services/order-status.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderStatusService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderStatusService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderStatusService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderStatusService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
