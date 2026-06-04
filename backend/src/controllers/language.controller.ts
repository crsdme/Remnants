import type { NextFunction, Response } from 'express'
import type { CreateLanguagePayload, EditLanguagePayload, GetLanguagesPayload, RemoveLanguagesPayload, ValidatedRequest } from '@/types'
import * as LanguageService from '@/services/language.service'

export async function get(
  req: ValidatedRequest<GetLanguagesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await LanguageService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateLanguagePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await LanguageService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditLanguagePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await LanguageService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveLanguagesPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await LanguageService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
