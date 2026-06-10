import type { NextFunction, Response } from 'express'
import type { ValidatedRequest } from '@/types'
import type { EditSettingPayload, GetSettingsPayload } from '@/types/'
import * as SettingService from '@/services/setting.service'

export async function get(
  req: ValidatedRequest<GetSettingsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SettingService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<EditSettingPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await SettingService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
