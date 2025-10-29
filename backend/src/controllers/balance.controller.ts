import type { NextFunction, Request, Response } from 'express'
import * as BalanceService from '../services/balance.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BalanceService.get(req.query)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BalanceService.getCurrent(req.query)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BalanceService.create(req.body, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await BalanceService.remove(req.params.id, req.user)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
