import type { NextFunction, Request, Response } from 'express'
import type { CreateBarcodesPayload, EditBarcodesPayload, GetBarcodeByCodePayload, GetBarcodesPayload, PrintBarcodePayload, RemoveBarcodesPayload, ValidatedRequest } from '@/types'
import * as BarcodeService from '@/services/barcode.service'

export async function get(
  req: ValidatedRequest<GetBarcodesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BarcodeService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getByCode(
  req: ValidatedRequest<GetBarcodeByCodePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BarcodeService.getByCode({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateBarcodesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BarcodeService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditBarcodesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BarcodeService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveBarcodesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BarcodeService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function generateCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await BarcodeService.generateCode()

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function print(
  req: ValidatedRequest<never, PrintBarcodePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { doc } = await BarcodeService.print({
      payload: req.validated.body,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=barcode.pdf')
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}
