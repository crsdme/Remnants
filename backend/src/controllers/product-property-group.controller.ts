import type { NextFunction, Response } from 'express'
import type { ValidatedRequest } from '@/types'
import type {
  CreateProductPropertyGroupPayload,
  EditProductPropertyGroupPayload,
  GetProductPropertyGroupsPayload,
  RemoveProductPropertyGroupPayload,
} from '@/types/'
import * as ProductPropertyGroupService from '@/services/product-property-group.service'

export async function get(
  req: ValidatedRequest<GetProductPropertyGroupsPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductPropertyGroupService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateProductPropertyGroupPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductPropertyGroupService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditProductPropertyGroupPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductPropertyGroupService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveProductPropertyGroupPayload, never>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceResponse = await ProductPropertyGroupService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
