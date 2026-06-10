import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema } from './common'

export const balanceSchema = z.object({
  id: idSchema,
  seq: z.number(),
  warehouseBalance: z.array(z.object({
    warehouseId: z.string(),
    totals: z.array(z.object({
      currencyId: z.string(),
      amount: z.number(),
    })),
  })),
  cashregisterBalance: z.array(z.object({
    cashregisterId: z.string(),
    totals: z.array(z.object({
      currencyId: z.string(),
      amount: z.number(),
    })),
  })),
  comment: z.string().optional(),
})

export const getBalanceSchema = z.object({
  filters: z.object({
    date: dateRangeSchema.default({
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    }),
    warehouses: z.array(z.string()).optional(),
    cashregisters: z.array(z.string()).optional(),
  }),
  pagination: paginationSchema.optional().default({}),
})

export type GetBalanceRequest = z.input<typeof getBalanceSchema>

export const getCurrentBalanceSchema = z.object({}).optional().default({})

export type GetCurrentBalanceRequest = z.input<typeof getCurrentBalanceSchema>

export const createBalanceSchema = z.object({
  comment: z.string().optional(),
})

export type CreateBalanceRequest = z.input<typeof createBalanceSchema>

export const removeBalanceSchema = z.object({
  id: idSchema,
})

export type RemoveBalanceRequest = z.input<typeof removeBalanceSchema>

export const getBalancesResponseSchema = responseListSchema(balanceSchema)
export type GetBalancesResponse = z.output<typeof getBalancesResponseSchema>

export const getCurrentBalanceResponseSchema = responseItemSchema(balanceSchema)
export type GetCurrentBalanceResponse = z.output<typeof getCurrentBalanceResponseSchema>

export const createBalanceResponseSchema = responseItemSchema(balanceSchema)
export type CreateBalanceResponse = z.output<typeof createBalanceResponseSchema>

export const removeBalancesResponseSchema = responseSchema
export type RemoveBalancesResponse = z.output<typeof removeBalancesResponseSchema>
