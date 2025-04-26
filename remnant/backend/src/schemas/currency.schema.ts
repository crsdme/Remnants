import { z } from 'zod'

export const getCurrencySchema = z.object({
  pagination: z
    .object({
      current: z.preprocess(val => Number(val), z.number()).optional(),
      pageSize: z.preprocess(val => Number(val), z.number()).optional(),
      full: z.preprocess(val => Boolean(val), z.boolean()).optional(),
    })
    .optional(),
  filters: z
    .object({
      names: z.string().optional(),
      symbols: z.string().optional(),
      language: z.string(),
      createdAt: z
        .object({
          from: z.preprocess((val) => {
            if (!val || (typeof val !== 'string' && typeof val !== 'number'))
              return undefined
            return new Date(val)
          }, z.date().optional()),
          to: z.preprocess((val) => {
            if (!val || (typeof val !== 'string' && typeof val !== 'number'))
              return undefined
            return new Date(val)
          }, z.date().optional()),
        })
        .optional(),
      active: z
        .preprocess((val) => {
          if (Array.isArray(val)) {
            return val.map(item => item === 'true')
          }
          return val === 'true'
        }, z.array(z.boolean()))
        .optional(),
    })
    .optional(),
  sorters: z
    .object({
      names: z.preprocess(val => Number(val), z.number()).optional(),
      priority: z.preprocess(val => Number(val), z.number()).optional(),
      updatedAt: z.preprocess(val => Number(val), z.number()).optional(),
      createdAt: z.preprocess(val => Number(val), z.number()).optional(),
    })
    .optional(),
})

export const createCurrencySchema = z.object({
  names: z.object({
    ru: z.string(),
    en: z.string(),
  }),
  symbols: z.object({
    ru: z.string(),
    en: z.string(),
  }),
  priority: z.number(),
  active: z.boolean().optional(),
})

export const editCurrencySchema = z.object({
  _id: z.string(),
  names: z.object({
    ru: z.string(),
    en: z.string(),
  }),
  symbols: z.object({
    ru: z.string(),
    en: z.string(),
  }),
  priority: z.number(),
  active: z.boolean().optional(),
})

export const removeCurrencySchema = z.object({
  _ids: z.array(z.string()),
})

export const batchCurrencySchema = z.object({
  _ids: z.array(z.string()).min(1, 'At least one currency ID is required'),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ),
})

export const importCurrenciesSchema = z.object({
  file: z.instanceof(File),
})
