import type { NextFunction, Request, Response } from 'express'
import * as OrderService from '../services/order.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderService.create(req.body, req.user)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderService.edit(req.body, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderService.remove(req.body, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
