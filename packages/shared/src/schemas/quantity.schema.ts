import { z } from 'zod'
import { idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getQuantitiesSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    product: idSchema.optional(),
    warehouse: idSchema.optional(),
    status: z.enum(['available', 'reserved', 'sold']).optional(),
  }).optional().default({}),
  sorters: z.object({
    count: sorterParamsSchema.optional(),
    status: sorterParamsSchema.optional(),
    warehouse: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export type GetQuantitiesRequest = z.input<typeof getQuantitiesSchema>

export const createQuantitiesSchema = z.object({
  count: z.number(),
  product: idSchema,
  warehouse: idSchema,
  status: z.enum(['available', 'reserved', 'sold']),
})

export type CreateQuantitiesRequest = z.input<typeof createQuantitiesSchema>

export const editQuantitiesSchema = z.object({
  id: idSchema,
  count: z.number(),
  product: idSchema,
  warehouse: idSchema,
  status: z.enum(['available', 'reserved', 'sold']),
})

export type EditQuantitiesRequest = z.input<typeof editQuantitiesSchema>

export const removeQuantitiesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveQuantitiesRequest = z.input<typeof removeQuantitiesSchema>
