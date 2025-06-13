import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getQuantitiesSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    product: z.string().optional(),
    warehouse: z.string().optional(),
    status: z.string().optional(),
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
  product: z.string(),
  warehouse: z.string(),
  status: z.string(),
})

export const editQuantitiesSchema = z.object({
  id: idSchema,
  count: z.number(),
  product: z.string(),
  warehouse: z.string(),
  status: z.string(),
})

export const removeQuantitiesSchema = z.object({
  ids: z.array(idSchema),
})
