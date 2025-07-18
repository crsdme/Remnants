import type { NextFunction, Request, Response } from 'express'
import * as OrderPaymentService from '../services/order-payment.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderPaymentService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderPaymentService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderPaymentService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderPaymentService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
