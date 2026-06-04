import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema } from './common'

export const getBalanceSchema = z.object({
  filters: z.object({
    date: dateRangeSchema,
    warehouses: z.array(z.string()).optional(),
    cashregisters: z.array(z.string()).optional(),
  }).optional().default({
    date: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  }),
})

export type GetBalanceParams = z.infer<typeof getBalanceSchema>

export const getCurrentBalanceSchema = z.object({
  pagination: paginationSchema.optional(),
})

export type GetCurrentBalanceParams = z.infer<typeof getCurrentBalanceSchema>

export const createBalanceSchema = z.object({
  comment: z.string().optional(),
})

export type CreateBalanceParams = z.infer<typeof createBalanceSchema>

export const removeBalanceSchema = z.object({
  id: idSchema,
})

export type RemoveBalanceParams = z.infer<typeof removeBalanceSchema>
