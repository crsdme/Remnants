import { z } from 'zod'
import { dateRangeSchema, idSchema, minorSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema } from './common'

export const balanceCurrencyTotalSchema = z.object({
  currencyId: idSchema,
  minorAmount: minorSchema,
})
export type BalanceCurrencyTotalDTO = z.output<typeof balanceCurrencyTotalSchema>

export const balanceComputedSchema = z.object({
  totalBalances: z.array(balanceCurrencyTotalSchema).default([]),
  cashregisterBalance: z.array(z.object({
    cashregisterId: idSchema,
    totals: z.array(balanceCurrencyTotalSchema),
  })).default([]),
  warehouseBalance: z.array(z.object({
    warehouseId: idSchema,
    totals: z.array(balanceCurrencyTotalSchema),
  })).default([]),
  transitBalance: z.array(z.object({
    warehouseTransactionId: idSchema,
    fromWarehouseId: idSchema.nullable().optional(),
    totals: z.array(balanceCurrencyTotalSchema),
  })).default([]),
  orderedNotReceivedBalance: z.array(z.object({
    procurementId: idSchema,
    supplierId: idSchema,
    totals: z.array(balanceCurrencyTotalSchema),
  })).default([]),
  prepaidBalance: z.array(z.object({
    procurementId: idSchema.optional(),
    supplierId: idSchema.optional(),
    totals: z.array(balanceCurrencyTotalSchema),
  })).default([]),
  receivableBalance: z.array(z.object({
    orderId: idSchema,
    clientId: idSchema.nullable().optional(),
    totals: z.array(balanceCurrencyTotalSchema),
  })).default([]),
  supplierDebtBalance: z.array(z.object({
    procurementId: idSchema,
    supplierId: idSchema,
    totals: z.array(balanceCurrencyTotalSchema),
  })).default([]),
  comment: z.string().optional(),
})
export type BalanceComputedDTO = z.output<typeof balanceComputedSchema>

export const balanceSchema = balanceComputedSchema.extend({
  id: idSchema,
  seq: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type BalanceDTO = z.output<typeof balanceSchema>

export const getBalanceSchema = z.object({
  filters: z.object({
    date: dateRangeSchema.default({
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    }),
    warehouses: z.array(idSchema).optional(),
    cashregisters: z.array(idSchema).optional(),
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

export const getCurrentBalanceResponseSchema = responseItemSchema(balanceComputedSchema)
export type GetCurrentBalanceResponse = z.output<typeof getCurrentBalanceResponseSchema>

export const createBalanceResponseSchema = responseItemSchema(balanceSchema)
export type CreateBalanceResponse = z.output<typeof createBalanceResponseSchema>

export const removeBalancesResponseSchema = responseSchema
export type RemoveBalancesResponse = z.output<typeof removeBalancesResponseSchema>
