import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

function hasIdsOrFilters(data: {
  ids?: unknown
  filters?: unknown
}) {
  return !!data.ids || !!data.filters
}

export const getProductSchema = z.object({
  filters: z.object({
    search: z.string().optional().transform(val => val?.trim() === '' ? undefined : val),
    seq: z.number().optional(),
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    price: numberFromStringSchema.optional(),
    purchasePrice: numberFromStringSchema.optional(),
    currency: z.string().optional(),
    purchaseCurrency: z.string().optional(),
    productPropertiesGroup: z.string().optional(),
    productProperties: z.any().optional(),
    unit: z.string().optional(),
    categories: z.array(idSchema).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    seq: sorterParamsSchema.optional(),
    names: sorterParamsSchema.optional(),
    price: sorterParamsSchema.optional(),
    purchasePrice: sorterParamsSchema.optional(),
    currency: sorterParamsSchema.optional(),
    purchaseCurrency: sorterParamsSchema.optional(),
    productPropertiesGroup: sorterParamsSchema.optional(),
    productProperties: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createProductSchema = z.object({
  names: languageStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  currency: z.string(),
  purchaseCurrency: z.string(),
  productPropertiesGroup: z.string(),
  productProperties: z.array(z.object({
    id: idSchema,
    value: z.any(),
  })),
  unit: idSchema,
  categories: z.array(idSchema).min(1),
  images: z.any().optional(),
  uploadedImages: z.any().optional(),
  uploadedImagesIds: z.any().optional(),
  generateBarcode: z.boolean().optional().default(false),
})

export const editProductSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  currency: z.string(),
  purchaseCurrency: z.string(),
  productPropertiesGroup: z.string(),
  productProperties: z.array(z.object({
    id: idSchema,
    value: z.any(),
  })),
  unit: idSchema,
  categories: z.array(idSchema).min(1),
  images: z.any().optional(),
  uploadedImages: z.any().optional(),
  uploadedImagesIds: z.any().optional(),
})

export const removeProductSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const duplicateProductSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const batchProductSchema = z.object({
  ids: z.array(idSchema).optional(),
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    price: numberFromStringSchema.optional(),
    purchasePrice: numberFromStringSchema.optional(),
    currency: z.string().optional(),
    purchaseCurrency: z.string().optional(),
    productPropertiesGroup: z.string().optional(),
    productProperties: z.any().optional(),
    unit: z.string().optional(),
    categories: z.array(idSchema).min(1).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional(),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ),
}).refine(hasIdsOrFilters, {
  message: 'Either ids or filters are required.',
})

export const importProductsSchema = z.object({
  file: z.instanceof(File),
})

export const exportProductsSchema = z.object({
  ids: z.array(idSchema).min(1).optional(),
})
