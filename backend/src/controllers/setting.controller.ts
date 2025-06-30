import type { NextFunction, Request, Response } from 'express'
import * as SettingService from '../services/setting.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await SettingService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await SettingService.edit(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
