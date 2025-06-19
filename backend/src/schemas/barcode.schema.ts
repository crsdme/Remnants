import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getBarcodeSchema = z.object({
  filters: z.object({
    id: idSchema.optional(),
    code: z.string().trim().optional(),
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
  pagination: paginationSchema.optional().default({}),
})

export const createBarcodeSchema = z.object({
  code: z.string().trim().optional(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export const editBarcodeSchema = z.object({
  id: idSchema,
  code: z.string().trim(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export const removeBarcodeSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const printBarcodeSchema = z.object({
  id: idSchema,
  size: z.string().optional().default('20x30'),
  language: z.string().optional().default('en'),
})
