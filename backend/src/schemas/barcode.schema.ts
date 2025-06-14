import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getBarcodeSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    code: z.string().optional(),
    products: z.array(idSchema).optional(),
    active: booleanArraySchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    code: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export const createBarcodeSchema = z.object({
  code: z.string(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
  })),
  active: z.boolean().optional(),
})

export const editBarcodeSchema = z.object({
  id: idSchema,
  code: z.string(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
  })),
  active: z.boolean().optional(),
})

export const removeBarcodeSchema = z.object({
  ids: z.array(idSchema),
})

export const printBarcodeSchema = z.object({
  id: idSchema,
  size: z.string().optional().default('20x30'),
})
