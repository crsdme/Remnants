import type { NextFunction, Request, Response } from 'express'
import type {
  CreateOrderPayload,
  EditOrderPayload,
  GetOrdersPayload,
  PrintDraftInvoiceOrderPayload,
  PrintInvoiceOrderPayload,
  PrintOrderLabelPayload,
  RemoveOrdersPayload,
  ValidatedRequest,
} from '@/types'

import * as OrderService from '@/services/order.service'

export async function get(
  req: ValidatedRequest<GetOrdersPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderService.get({
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
  req: ValidatedRequest<CreateOrderPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderService.create({
      payload: req.body,
      user: req.user,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditOrderPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderService.edit({
      payload: req.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveOrdersPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderService.remove({
      payload: req.body,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function printInvoice(
  req: ValidatedRequest<PrintInvoiceOrderPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { doc } = await OrderService.printInvoice({
      payload: req.validated.body,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-invoice-${req.validated.body.seq}.pdf`)
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}

export async function printDraftInvoice(
  req: ValidatedRequest<PrintDraftInvoiceOrderPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { doc } = await OrderService.printDraftInvoice({
      payload: req.validated.body,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-draft-invoice.pdf`)
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}

export async function printOrderLabel(
  req: ValidatedRequest<PrintOrderLabelPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { doc } = await OrderService.printOrderLabel({
      payload: req.validated.body,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-label-${req.validated.body.order}.pdf`)
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}
