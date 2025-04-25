import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const getCurrencySchema = z.object({
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

export function validateGetCurrencies(req: Request, res: Response, next: NextFunction) {
  try {
    const result = getCurrencySchema.safeParse(req.query)
    req.body = result.data
    next()
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid get currency data' })
  }
}

const createCurrencySchema = z.object({
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

export function validateCreateCurrency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = createCurrencySchema.safeParse(req.body)
    req.body = result.data
    next()
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid create currency data' })
  }
}

const editCurrencySchema = z.object({
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

export function validateEditCurrency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = editCurrencySchema.safeParse(req.body)
    req.body = result.data
    next()
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid edit currency data' })
  }
}

const removeCurrencySchema = z.object({
  _ids: z.array(z.string()),
})

export function validateRemoveCurrency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = removeCurrencySchema.safeParse(req.body)
    req.body = result.data
    next()
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid remove currency data' })
  }
}

const batchCurrencySchema = z.object({
  _ids: z.array(z.string()).min(1, 'At least one currency ID is required'),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ),
})

export function validateBatchCurrency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = batchCurrencySchema.safeParse(req.body)
    req.body = result.data
    next()
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid batch currency data' })
  }
}

const importCurrenciesSchema = z.object({
  file: z.instanceof(File),
})

export function validateImportCurrencies(req: Request, res: Response, next: NextFunction) {
  try {
    const result = importCurrenciesSchema.safeParse(req.body)
    req.body = result.data
    next()
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Invalid import currencies data' })
  }
}
