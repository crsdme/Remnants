import type { NextFunction, Request, Response } from 'express'
import * as CategoryService from '../services/category.service'
import { HttpError } from '../utils/httpError'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CategoryService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CategoryService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CategoryService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CategoryService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function batch(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CategoryService.batch(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function duplicate(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CategoryService.duplicate(req.body)

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

    const serviceResponse = await CategoryService.importHandler({ file: req.file })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function exportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CategoryService.exportHandler(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
