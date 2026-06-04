import type { NextFunction, Response } from 'express'
import type {
  CreateCurrencyPayload,
  EditCurrencyPayload,
  EditExchangeRatePayload,
  GetCurrencyPayload,
  GetExchangeRatesPayload,
  RemoveCurrencyPayload,
  ValidatedRequest,
} from '@/types'
import * as CurrencyService from '@/services/currency.service'

export async function get(
  req: ValidatedRequest<GetCurrencyPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CurrencyService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function create(
  req: ValidatedRequest<never, CreateCurrencyPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CurrencyService.create({
      payload: req.validated.body,
    })

    res.status(201).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function edit(
  req: ValidatedRequest<never, EditCurrencyPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CurrencyService.edit({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function remove(
  req: ValidatedRequest<never, RemoveCurrencyPayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CurrencyService.remove({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function getExchangeRates(
  req: ValidatedRequest<GetExchangeRatesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CurrencyService.getExchangeRates({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}

export async function editExchangeRate(
  req: ValidatedRequest<never, EditExchangeRatePayload>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await CurrencyService.editExchangeRate({
      payload: req.validated.body,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
