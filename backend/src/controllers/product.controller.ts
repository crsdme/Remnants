import type { NextFunction, Response } from 'express'
import type { BatchProductsPayload, CreateProductsPayload, EditProductsPayload, GetProductsPayload, ImportProductsPayload, RemoveProductsPayload, ValidatedAuthedRequest, ValidatedRequest } from '@/types/'

import * as ProductService from '@/services/product.service'
import { HttpError } from '@/utils/httpError'

export async function get(
  req: ValidatedAuthedRequest<never, GetProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.get({ payload: req.validated.query, user: req.user })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedAuthedRequest<never, CreateProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.files === undefined)
      req.files = []

    const serviceResponse = await ProductService.create({
      payload: req.validated.body,
      uploadedImages: req.files as Express.Multer.File[],
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedAuthedRequest<never, EditProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.edit({
      payload: req.validated.body,
      uploadedImages: req.files as Express.Multer.File[],
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedAuthedRequest<never, RemoveProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.remove({ payload: req.validated.body })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function batch(
  req: ValidatedRequest<never, BatchProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.batch({ payload: req.validated.body })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function importHandler(
  req: ValidatedRequest<never, ImportProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      throw new HttpError(400, 'No file uploaded', 'NO_FILE_UPLOADED')
    }

    const serviceResponse = await ProductService.importHandler({ file: req.file })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function exportHandler(
  req: ValidatedAuthedRequest<never, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.exportHandler({
      payload: req.validated.body,
      user: req.user,
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('X-Export-Code', serviceResponse.code)
    res.setHeader('X-Export-Message', serviceResponse.message ?? '')
    res.setHeader('Access-Control-Expose-Headers', 'x-export-code, x-export-message')
    res.send(serviceResponse.buffer)
  }
  catch (err) {
    next(err)
  }
}

export async function downloadTemplate(
  req: ValidatedAuthedRequest<never, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.downloadTemplate({ user: req.user })
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('X-Export-Code', serviceResponse.code)
    res.setHeader('X-Export-Message', serviceResponse.message ?? '')
    res.setHeader('Access-Control-Expose-Headers', 'x-export-code, x-export-message')
    res.send(serviceResponse.buffer)
  }
  catch (err) {
    next(err)
  }
}
