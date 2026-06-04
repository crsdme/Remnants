import type { NextFunction, Response } from 'express'
import type { CreateClientPayload, EditClientPayload, GetClientsPayload, RemoveClientsPayload, ValidatedRequest } from '@/types'
import * as ClientService from '@/services/client.service'

export async function get(
  req: ValidatedRequest<GetClientsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ClientService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateClientPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ClientService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditClientPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ClientService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveClientsPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await ClientService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
