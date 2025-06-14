import type { NextFunction, Request, Response } from 'express'
import * as BarcodeService from '../services/barcode.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BarcodeService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BarcodeService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BarcodeService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BarcodeService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function print(req: Request, res: Response, next: NextFunction) {
  try {
    const { doc } = await BarcodeService.print(req.body)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=barcode.pdf')
    doc.pipe(res)
    doc.end()
  }
  catch (err) {
    next(err)
  }
}
