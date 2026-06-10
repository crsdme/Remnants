import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from '@remnant/shared'
import { z } from 'zod'

export const getProductRepoSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    search: z.string().optional().transform(val => val?.trim() === '' ? undefined : val),
    seq: numberFromStringSchema.optional(),
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    price: numberFromStringSchema.optional(),
    purchasePrice: numberFromStringSchema.optional(),
    currency: z.array(idSchema).optional(),
    purchaseCurrency: z.array(idSchema).optional(),
    productPropertiesGroup: z.array(idSchema).optional(),
    productProperties: z.array(idSchema).optional(),
    unit: z.array(idSchema).optional(),
    barcodes: z.string().optional(),
    categories: z.array(idSchema).optional(),
    selectedWarehouse: z.string().optional(),
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
    quantity: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
  hasPurchasePricePermission: z.boolean().optional().default(false),
})

export const createProductRepoSchema = z.object({
  names: languageStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  currency: z.string(),
  purchaseCurrency: z.string(),
  productPropertiesGroup: z.string(),
  productProperties: z.array(z.object({
    _id: idSchema,
    value: z.unknown(),
  })),
  unit: idSchema,
  categories: z.array(idSchema).min(1),
  images: z.array(z.object({
    filename: z.string(),
    path: z.string(),
  })).optional().default([]),
})

export const editProductRepoSchema = z.object({
  names: languageStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  currency: z.string(),
  purchaseCurrency: z.string(),
  productPropertiesGroup: z.string(),
  productProperties: z.array(z.object({
    _id: idSchema,
    value: z.unknown(),
  })),
  unit: idSchema,
  categories: z.array(idSchema).min(1),
  images: z.array(z.object({
    filename: z.string(),
    path: z.string(),
  })).optional().default([]),
})
