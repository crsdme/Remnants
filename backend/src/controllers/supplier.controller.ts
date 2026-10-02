import type { NextFunction, Response } from 'express'
import type { CreateSupplierPayload, EditSupplierPayload, GetSuppliersPayload, RemoveSuppliersPayload, ValidatedRequest } from '@/types'
import * as SupplierService from '@/services/supplier.service'

export async function get(
  req: ValidatedRequest<GetSuppliersPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SupplierService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateSupplierPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SupplierService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditSupplierPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SupplierService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveSuppliersPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SupplierService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
