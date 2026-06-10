import type { NextFunction, Response } from 'express'
import type { CreateUnitPayload, EditUnitPayload, GetUnitsPayload, RemoveUnitsPayload, ValidatedRequest } from '@/types'
import * as UnitService from '@/services/unit.service'

export async function get(
  req: ValidatedRequest<GetUnitsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UnitService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateUnitPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UnitService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditUnitPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UnitService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveUnitsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UnitService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
