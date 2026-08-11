import type { Response } from '../types/common.type'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageCodeSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { productSchemaPopulated } from './product.schema'

export const barcodeDTOSchema = z.object({
  id: idSchema,
  code: z.string().trim(),
  products: z.array(productSchemaPopulated.extend({
    unitsPerScan: z.number().int().positive(),
  })),
  active: z.boolean().optional().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type BarcodeDTO = z.output<typeof barcodeDTOSchema>

export const barcodeDTOPopulatedSchema = barcodeDTOSchema.omit({
  products: true,
}).extend({
  products: z.array(productSchemaPopulated.extend({
    unitsPerScan: z.number().int().positive(),
  })),
})

export type BarcodeDTOPopulated = z.output<typeof barcodeDTOPopulatedSchema>

export const getBarcodesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional().default([]),
    codes: z.array(z.string().trim()).optional().default([]),
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
  pagination: paginationSchema.optional().default({}),
})

export type GetBarcodesRequest = z.input<typeof getBarcodesSchema>

export const createBarcodeSchema = z.object({
  code: z.string().trim().optional(),
  products: z.array(z.object({
    id: idSchema,
    unitsPerScan: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export type CreateBarcodeRequest = z.input<typeof createBarcodeSchema>

export const editBarcodeSchema = z.object({
  id: idSchema,
  code: z.string().trim(),
  products: z.array(z.object({
    id: idSchema,
    unitsPerScan: z.number().int().positive(),
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
  language: languageCodeSchema.default('en'),
})

export type PrintBarcodeRequest = z.input<typeof printBarcodeSchema>

export const getBarcodeByCodeSchema = z.object({
  code: z.string().trim(),
})

export type GetBarcodeByCodeRequest = z.input<typeof getBarcodeByCodeSchema>

export const getBarcodeByCodeResponseSchema = responseItemSchema(barcodeDTOPopulatedSchema)
export type GetBarcodeByCodeResponse = z.output<typeof getBarcodeByCodeResponseSchema>

export const getBarcodesResponseSchema = responseListSchema(barcodeDTOPopulatedSchema)
export type GetBarcodesResponse = z.output<typeof getBarcodesResponseSchema>

export const createBarcodeResponseSchema = responseSchema
export type CreateBarcodeResponse = z.output<typeof createBarcodeResponseSchema>

export const editBarcodeResponseSchema = responseSchema
export type EditBarcodeResponse = z.output<typeof editBarcodeResponseSchema>

export const removeBarcodesResponseSchema = responseSchema
export type RemoveBarcodesResponse = z.output<typeof removeBarcodesResponseSchema>

export const printBarcodeResponseSchema = responseSchema
export type PrintBarcodeResponse<T> = Response & { doc: T }

export const generateCodeResponseSchema = responseItemSchema(z.string())
export type GenerateCodeResponse = z.output<typeof generateCodeResponseSchema>
