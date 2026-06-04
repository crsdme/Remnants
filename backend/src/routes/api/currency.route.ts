import type { RequestHandler } from 'express'
import {
  createCurrencySchema,
  editCurrencySchema,
  editExchangeRateSchema,
  getCurrencySchema,
  getExchangeRatesSchema,
  removeCurrencySchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as CurrencyController from '@/controllers/currency.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCurrencySchema),
  CurrencyController.get as RequestHandler,
)

router.get(
  '/get-exchange-rates',
  validateQueryRequest(getExchangeRatesSchema),
  CurrencyController.getExchangeRates as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCurrencySchema),
  checkPermissions('currency.create'),
  CurrencyController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCurrencySchema),
  checkPermissions('currency.edit'),
  CurrencyController.edit as RequestHandler,
)

router.post(
  '/edit-exchange-rate',
  validateBodyRequest(editExchangeRateSchema),
  checkPermissions('exchange-rate.edit'),
  CurrencyController.editExchangeRate as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCurrencySchema),
  checkPermissions('currency.remove'),
  CurrencyController.remove as RequestHandler,
)

export default router
