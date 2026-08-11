import type { RequestHandler } from 'express'
import {
  createCurrencyResponseSchema,
  createCurrencySchema,
  editCurrencyResponseSchema,
  editCurrencySchema,
  editExchangeRateResponseSchema,
  editExchangeRateSchema,
  getCurrenciesResponseSchema,
  getCurrencySchema,
  getExchangeRatesResponseSchema,
  getExchangeRatesSchema,
  removeCurrenciesResponseSchema,
  removeCurrencySchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as CurrencyController from '@/controllers/currency.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCurrencySchema),
  validateResponse(getCurrenciesResponseSchema),
  CurrencyController.get as RequestHandler,
)

router.get(
  '/get-exchange-rates',
  validateQueryRequest(getExchangeRatesSchema),
  validateResponse(getExchangeRatesResponseSchema),
  CurrencyController.getExchangeRates as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCurrencySchema),
  checkPermissions('currency.create'),
  validateResponse(createCurrencyResponseSchema),
  CurrencyController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCurrencySchema),
  checkPermissions('currency.edit'),
  validateResponse(editCurrencyResponseSchema),
  CurrencyController.edit as RequestHandler,
)

router.post(
  '/edit-exchange-rate',
  validateBodyRequest(editExchangeRateSchema),
  checkPermissions('exchange-rate.edit'),
  validateResponse(editExchangeRateResponseSchema),
  CurrencyController.editExchangeRate as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCurrencySchema),
  checkPermissions('currency.remove'),
  validateResponse(removeCurrenciesResponseSchema),
  CurrencyController.remove as RequestHandler,
)

export default router
