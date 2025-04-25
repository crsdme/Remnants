import type { NextFunction, Request, Response } from 'express'
import * as LanguageService from '../services/language.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await LanguageService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await LanguageService.create(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await LanguageService.edit(req.body)

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
    await sleep(1000)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await LanguageService.remove(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
