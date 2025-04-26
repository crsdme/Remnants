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
