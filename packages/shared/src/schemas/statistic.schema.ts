import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, responseItemSchema } from './common/'

export const getStatisticSchema = z.object({
  filters: z.object({
    date: dateRangeSchema,
    cashregister: z.array(idSchema).optional().default([]),
    cashregisterAccount: z.array(idSchema).optional().default([]),
  }).optional().default({
    date: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  }),
})

export type GetOrderStatisticRequest = z.input<typeof getStatisticSchema>
export type GetOrderStatisticPayload = z.output<typeof getStatisticSchema>

const statisticCurrencySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  scale: numberFromStringSchema,
})

export const statisticMoneySchema = z.object({
  currency: statisticCurrencySchema,
  total: z.number(),
})

export type StatisticMoneyDTO = z.output<typeof statisticMoneySchema>

const statisticCountAmountSchema = z.object({
  count: z.number().int().nonnegative(),
  amount: z.array(statisticMoneySchema),
})

const statisticExpenseCategorySchema = z.object({
  category: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  count: z.number().int().nonnegative(),
  currencies: z.array(statisticMoneySchema),
})

const statisticProductSchema = z.object({
  product: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  quantity: z.number().nonnegative(),
  amount: z.array(statisticMoneySchema),
  profit: z.array(statisticMoneySchema).optional(),
})

const statisticSeriesPointSchema = z.object({
  date: z.string(),
  turnover: z.array(statisticMoneySchema),
  income: z.array(statisticMoneySchema),
  expenses: z.array(statisticMoneySchema),
  profit: z.array(statisticMoneySchema),
})

export const statisticsSchema = z.object({
  range: dateRangeSchema,
  orders: z.object({
    count: z.number().int().nonnegative(),
    amount: z.array(statisticMoneySchema),
    paid: statisticCountAmountSchema,
    unpaid: statisticCountAmountSchema,
  }),
  payments: z.object({
    count: z.number().int().nonnegative(),
    amount: z.array(statisticMoneySchema),
    income: statisticCountAmountSchema,
    expense: z.object({
      count: z.number().int().nonnegative(),
      amount: z.array(statisticMoneySchema),
      categories: z.array(statisticExpenseCategorySchema),
    }),
    /** Cash profit: income − expenses */
    profit: statisticCountAmountSchema,
    /** Product margin: sum of item profits (only when user has order.profit) */
    margin: statisticCountAmountSchema.optional(),
  }),
  products: z.object({
    count: z.number().int().nonnegative(),
    items: z.array(statisticProductSchema),
  }),
  series: z.array(statisticSeriesPointSchema),
})

export type StatisticsDTO = z.output<typeof statisticsSchema>

export const getStatisticResponseSchema = responseItemSchema(statisticsSchema)
export type GetStatisticResponse = z.output<typeof getStatisticResponseSchema>
