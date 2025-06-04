import type { NextFunction, Request, Response } from 'express'
import * as UserRoleService from '../services/user-role.service'
import { HttpError } from '../utils/httpError'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserRoleService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserRoleService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserRoleService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserRoleService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function duplicate(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UserRoleService.duplicate(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function importHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new HttpError(400, 'No file uploaded', 'NO_FILE_UPLOADED')
    }

    const serviceResponse = await UserRoleService.importHandler({ file: req.file })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
