import type { NextFunction, Request, Response } from 'express'
import * as CurrencyService from '../services/currency.service'
import { HttpError } from '../utils/httpError'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CurrencyService.get(req.body)

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
    const serviceResponse = await CurrencyService.create(req.body)

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CurrencyService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CurrencyService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function batch(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CurrencyService.batch(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function duplicate(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await CurrencyService.duplicate(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new HttpError(400, 'No file uploaded', 'NO_FILE_UPLOADED')
    }

    const serviceResponse = await CurrencyService.upload({ file: req.file })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
