import type { DuplicateProductsPayload } from '@remnant/shared'
import type { NextFunction, Response } from 'express'
import type { BatchProductsPayload, CreateProductsPayload, EditProductsPayload, GetProductsPayload, ImportProductsPayload, RemoveProductsPayload, ValidatedRequest } from '@/types/'

import * as ProductService from '@/services/product.service'
import { HttpError } from '@/utils/httpError'

export async function get(
  req: ValidatedRequest<never, GetProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.get(req.validated.query, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    req.validated.body.uploadedImages = req.files
    const serviceResponse = await ProductService.create(req.validated.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    req.validated.body.uploadedImages = req.files
    const serviceResponse = await ProductService.edit(req.validated.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.remove(req.validated.body)

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
    const serviceResponse = await ProductService.batch(req.validated.body)

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

    const serviceResponse = await ProductService.importHandler({ file: req.validated.file })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function exportHandler(
  req: ValidatedRequest<never, ExportProductsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.exportHandler(req.validated.body, req.user)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('X-Export-Code', serviceResponse.code)
    res.setHeader('X-Export-Message', serviceResponse.message)
    res.setHeader('Access-Control-Expose-Headers', 'x-export-code, x-export-message')
    res.send(serviceResponse.buffer)
  }
  catch (err) {
    next(err)
  }
}

export async function downloadTemplate(
  req: ValidatedRequest<never, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ProductService.downloadTemplate(req.user)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('X-Export-Code', serviceResponse.code)
    res.setHeader('X-Export-Message', serviceResponse.message)
    res.setHeader('Access-Control-Expose-Headers', 'x-export-code, x-export-message')
    res.send(serviceResponse.buffer)
  }
  catch (err) {
    next(err)
  }
}
