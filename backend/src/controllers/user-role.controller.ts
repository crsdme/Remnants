import type { CreateUserRoleRequest, EditUserRoleRequest, GetUserRoleRequest, RemoveUserRoleRequest } from '@remnant/shared'
import type { NextFunction, Response } from 'express'
import type { ValidatedRequest } from '@/types/'
import * as UserRoleService from '@/services/user-role.service'

export async function get(
  req: ValidatedRequest<GetUserRoleRequest>,
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
  req: ValidatedRequest<CreateUserRoleRequest>,
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
  req: ValidatedRequest<EditUserRoleRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await UserRoleService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<RemoveUserRoleRequest>,
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
