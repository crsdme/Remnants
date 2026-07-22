import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const currencySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  scale: z.number().optional().default(2),
  paymentEpsilon: z.number().positive(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CurrencyDTO = z.output<typeof currencySchema>

export const exchangeRateSchema = z.object({
  id: idSchema,
  fromCurrency: idSchema,
  toCurrency: idSchema,
  rate: z.number(),
  comment: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ExchangeRateDTO = z.output<typeof exchangeRateSchema>

export const exchangeRateSchemaPopulated = z.object({
  id: idSchema,
  fromCurrency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number().optional().default(2),
    paymentEpsilon: z.number().positive(),
    priority: z.number().optional().default(0),
    active: z.boolean().optional().default(true),
  }),
  toCurrency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number().optional().default(2),
    paymentEpsilon: z.number().positive(),
    priority: z.number().optional().default(0),
    active: z.boolean().optional().default(true),
  }),
  rate: z.number(),
  comment: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ExchangeRateDTOPopulated = z.output<typeof exchangeRateSchemaPopulated>

export const getCurrencySchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().trim().optional(),
    symbols: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    priority: numberFromStringSchema.optional(),
    cashregisterAccount: z.array(idSchema).default([]),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    symbols: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetCurrencyRequest = z.input<typeof getCurrencySchema>

export const createCurrencySchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  scale: z.number().optional().default(2),
  paymentEpsilon: z.number().positive().optional(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type CreateCurrencyRequest = z.input<typeof createCurrencySchema>

export const editCurrencySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  scale: z.number().optional().default(2),
  paymentEpsilon: z.number().positive().optional(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type EditCurrencyRequest = z.input<typeof editCurrencySchema>

export const removeCurrencySchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveCurrencyRequest = z.input<typeof removeCurrencySchema>

export const getExchangeRatesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    fromCurrency: idSchemaOptional,
    toCurrency: idSchemaOptional,
  }).optional().default({}),
  sorters: z.object({
    rate: sorterParamsSchema.optional(),
    comment: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema,
})

export type GetExchangeRatesRequest = z.input<typeof getExchangeRatesSchema>

export const editExchangeRateSchema = z.object({
  id: idSchema,
  rate: z.number(),
  comment: z.string().optional(),
})

export type EditExchangeRateRequest = z.input<typeof editExchangeRateSchema>

export const getCurrenciesResponseSchema = responseListSchema(currencySchema)
export type GetCurrenciesResponse = z.output<typeof getCurrenciesResponseSchema>

export const createCurrencyResponseSchema = responseItemSchema(currencySchema)
export type CreateCurrencyResponse = z.output<typeof createCurrencyResponseSchema>

export const editCurrencyResponseSchema = responseItemSchema(currencySchema)
export type EditCurrencyResponse = z.output<typeof editCurrencyResponseSchema>

export const removeCurrenciesResponseSchema = responseSchema
export type RemoveCurrenciesResponse = z.output<typeof removeCurrenciesResponseSchema>

export const getExchangeRatesResponseSchema = responseListSchema(exchangeRateSchemaPopulated)
export type GetExchangeRatesResponse = z.output<typeof getExchangeRatesResponseSchema>

export const editExchangeRateResponseSchema = responseItemSchema(exchangeRateSchema)
export type EditExchangeRateResponse = z.output<typeof editExchangeRateResponseSchema>
