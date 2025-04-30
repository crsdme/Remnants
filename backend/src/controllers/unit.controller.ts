import type { NextFunction, Request, Response } from 'express'
import * as UnitService from '../services/unit.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UnitService.get(req.body)

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
    await sleep(1000)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UnitService.create(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UnitService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UnitService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function batch(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UnitService.batch(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function duplicate(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await UnitService.duplicate(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new Error('No file uploaded')
    }

    const serviceResponse = await UnitService.upload({ file: req.file })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
