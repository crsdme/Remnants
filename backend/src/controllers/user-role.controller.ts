import type { NextFunction, Response } from 'express'
import type { CreateUserRolesPayload, EditUserRolesPayload, GetUserRolesPayload, RemoveUserRolesPayload, ValidatedRequest } from '@/types/'
import * as UserRoleService from '@/services/user-role.service'

export async function get(
  req: ValidatedRequest<never, GetUserRolesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserRoleService.get(req.validated.query)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateUserRolesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserRoleService.create(req.validated.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditUserRolesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserRoleService.edit(req.validated.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveUserRolesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserRoleService.remove(req.validated.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
