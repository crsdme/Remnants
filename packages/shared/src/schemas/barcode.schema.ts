import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getBarcodesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).default([]),
    codes: z.array(z.string().trim()).default([]),
    products: z.array(idSchema).optional(),
    active: booleanArraySchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).default({}),
  sorters: z.object({
    code: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional(),
})

export type GetBarcodesRequest = z.input<typeof getBarcodesSchema>

export const createBarcodeSchema = z.object({
  code: z.string().trim().optional(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export type CreateBarcodeRequest = z.input<typeof createBarcodeSchema>

export const editBarcodeSchema = z.object({
  id: idSchema,
  code: z.string().trim(),
  products: z.array(z.object({
    id: idSchema,
    quantity: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export type EditBarcodeRequest = z.input<typeof editBarcodeSchema>

export const removeBarcodesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveBarcodesRequest = z.input<typeof removeBarcodesSchema>

const arrayFromQuery = z
  .union([z.array(z.string()), z.string()])
  .transform(v => (Array.isArray(v) ? v : [v]))
  .transform(arr => arr.map(s => s.trim()).filter(Boolean))

export const printBarcodeSchema = z.object({
  ids: arrayFromQuery.optional().default([]),
  codes: arrayFromQuery.optional().default([]),
  size: z.string().default('20x30'),
  language: z.string().default('en'),
})

export type PrintBarcodeRequest = z.input<typeof printBarcodeSchema>
