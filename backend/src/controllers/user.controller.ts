import type { NextFunction, Response } from 'express'
import type { CreateUsersPayload, EditUsersPayload, GetUsersPayload, RemoveUsersPayload, ValidatedRequest } from '@/types/'
import * as UserService from '@/services/user.service'

export async function get(
  req: ValidatedRequest<never, GetUsersPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserService.get(req.validated.query)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<CreateUsersPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserService.create(req.validated.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditUsersPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserService.edit(req.validated.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveUsersPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserService.remove(req.validated.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
