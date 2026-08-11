import type { NextFunction, Response } from 'express'
import type {
  CreateOrderPayload,
  EditOrderPayload,
  GetOrderDetailsPayload,
  GetOrderItemsPayload,
  GetOrdersPayload,
  PrintDraftInvoiceOrderPayload,
  PrintInvoiceOrderPayload,
  PrintOrderLabelOrderPayload,
  RemoveOrdersPayload,
  ValidatedAuthedRequest,
  ValidatedRequest,
} from '@/types'

import * as OrderService from '@/services/order.service'

export async function get(
  req: ValidatedAuthedRequest<GetOrdersPayload, never>,
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

export async function getItems(
  req: ValidatedAuthedRequest<GetOrderItemsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderService.getItems({
      payload: req.validated.query,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getDetails(
  req: ValidatedAuthedRequest<GetOrderDetailsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderService.getDetails({
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
  req: ValidatedAuthedRequest<never, CreateOrderPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.files === undefined)
      req.files = []

    const serviceResponse = await OrderService.create({
      payload: req.validated.body,
      uploadedFiles: req.files as Express.Multer.File[],
      user: req.user,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedAuthedRequest<never, EditOrderPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.files === undefined)
      req.files = []

    const serviceResponse = await OrderService.edit({
      payload: req.validated.body,
      uploadedFiles: req.files as Express.Multer.File[],
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedAuthedRequest<never, RemoveOrdersPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await OrderService.remove({
      payload: req.validated.body,
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
      payload: req.validated.query,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-invoice-${req.validated.query.seq}.pdf`)

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
  req: ValidatedRequest<PrintOrderLabelOrderPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { doc } = await OrderService.printOrderLabel({
      payload: req.validated.body,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=order-label-${req.validated.query.seq}.pdf`)
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}
