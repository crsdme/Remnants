import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

function hasIdsOrFilters(data: {
  ids?: unknown
  filters?: unknown
}) {
  return !!data.ids || !!data.filters
}

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
  pagination: paginationSchema,
})

export type GetCurrencyRequest = z.input<typeof getCurrencySchema>

export const createCurrencySchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  scale: z.number().optional().default(2),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type CreateCurrencyRequest = z.input<typeof createCurrencySchema>

export const editCurrencySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  scale: z.number().optional().default(2),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type EditCurrencyRequest = z.input<typeof editCurrencySchema>

export const removeCurrencySchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveCurrencyRequest = z.input<typeof removeCurrencySchema>

export const duplicateCurrencySchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type DuplicateCurrencyRequest = z.input<typeof duplicateCurrencySchema>

export const batchCurrencySchema = z.object({
  ids: z.array(idSchema).optional(),
  filters: z.object({
    names: z.string().trim().optional(),
    symbols: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ).min(1),
}).refine(hasIdsOrFilters, {
  message: 'Either ids or filters are required.',
})

export type BatchCurrencyRequest = z.input<typeof batchCurrencySchema>

export const importCurrenciesSchema = z.object({
  file: z.instanceof(File),
})

export type ImportCurrenciesRequest = z.input<typeof importCurrenciesSchema>

export const getExchangeRatesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    fromCurrency: idSchema.optional(),
    toCurrency: idSchema.optional(),
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
