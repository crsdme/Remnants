import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

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

export const createQuantitiesSchema = z.object({
  count: z.number(),
  product: idSchema,
  warehouse: idSchema,
  status: z.enum(['available', 'reserved', 'sold']),
})

export const editQuantitiesSchema = z.object({
  id: idSchema,
  count: z.number(),
  product: idSchema,
  warehouse: idSchema,
  status: z.enum(['available', 'reserved', 'sold']),
})

export const removeQuantitiesSchema = z.object({
  ids: z.array(idSchema).min(1),
})
