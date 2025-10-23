import type { NextFunction, Request, Response } from 'express'
import * as OrderService from '../services/order.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await OrderService.get(req.body, req.user)

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

export async function printInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { doc } = await OrderService.printInvoice(req.body)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-invoice-${req.body.seq}.pdf`)
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}

export async function printDraftInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { doc } = await OrderService.printDraftInvoice(req.body)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-draft-invoice.pdf`)
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}

export async function printOrderLabel(req: Request, res: Response, next: NextFunction) {
  try {
    const { doc } = await OrderService.printOrderLabel(req.body)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-label-${req.body.order}.pdf`)
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}
