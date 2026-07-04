import type { Buffer } from 'node:buffer'
import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

function hasIdsOrFilters(data: {
  ids?: unknown
  filters?: unknown
}) {
  return !!data.ids || !!data.filters
}

export const productSchema = z.object({
  id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  currency: idSchema,
  purchaseCurrency: idSchema,
  barcodes: z.array(idSchema),
  categories: z.array(idSchema),
  unit: idSchema,
  productPropertiesGroup: idSchema,
  productProperties: z.array(idSchema),
  warehouseStock: z.array(z.object({
    warehouse: idSchema,
    count: z.number(),
  })),
  images: z.array(z.object({
    id: idSchema,
    filename: z.string(),
    name: z.string(),
    type: z.string(),
    path: z.string(),
  })),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const productSchemaPopulated = z.object({
  id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
  }),
  purchaseCurrency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
  }),
  barcodes: z.array(z.object({
    code: z.string(),
    id: idSchema,
  })),
  categories: z.array(z.object({
    id: idSchema,
    names: languageStringSchema,
  })),
  unit: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
  }),
  productPropertiesGroup: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  productProperties: z.array(z.object({
    id: idSchema,
    options: z.array(z.object({
      id: idSchema,
      names: languageStringSchema,
      color: z.string().optional(),
    })),
    value: z.unknown(),
    data: z.object({
      type: z.string(),
      names: languageStringSchema,
      showInTable: z.boolean(),
      isRequired: z.boolean(),
      symbols: languageStringSchema,
    }),
  })),
  warehouseStock: z.array(z.object({
    warehouse: idSchema,
    count: z.number(),
  })),
  images: z.array(z.object({
    id: idSchema,
    filename: z.string(),
    name: z.string(),
    type: z.string(),
    path: z.string(),
  })),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductDTO = z.output<typeof productSchema>

export type ProductPopulatedDTO = z.output<typeof productSchemaPopulated>

export const getProductSchema = z.object({
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
    warehouseStock: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProductRequest = z.input<typeof getProductSchema>

export const getProductIndexSchema = z.object({
  productId: idSchema,
  filters: z.object({
    search: z.string().optional().transform(val => val?.trim() === '' ? undefined : val),
    ids: z.array(idSchema).optional(),
    seq: numberFromStringSchema.optional(),
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    price: numberFromStringSchema.optional(),
    purchasePrice: numberFromStringSchema.optional(),
    barcodes: z.string().optional(),
    categories: z.array(idSchema).optional(),
    unit: z.array(idSchema).optional(),
    productPropertiesGroup: z.array(idSchema).optional(),
    productProperties: z.array(idSchema).optional(),
  }).optional().default({}),
})

export type GetProductIndexRequest = z.input<typeof getProductIndexSchema>

export const createProductSchema = z.object({
  names: languageStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  currency: z.string(),
  purchaseCurrency: z.string(),
  productPropertiesGroup: z.string(),
  productProperties: z.array(z.object({
    id: idSchema,
    value: z.unknown(),
  })),
  unit: idSchema,
  categories: z.array(idSchema).min(1),
  images: z.array(z.object({
    filename: z.string(),
    originalname: z.string(),
    mimetype: z.string(),
    path: z.string(),
  })).optional().default([]),
  uploadedImages: z.array(z.object({
    filename: z.string(),
    originalname: z.string(),
    mimetype: z.string(),
    path: z.string(),
  })).optional().default([]),
  uploadedImagesIds: z.array(idSchema).optional(),
  generateBarcode: z.boolean().optional().default(false),
  isAutoSyncEnabled: z.boolean().optional().default(false),
  syncSites: z.array(idSchema).optional().default([]),
})

export type CreateProductRequest = z.input<typeof createProductSchema>

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
    value: z.unknown(),
  })),
  unit: idSchema,
  categories: z.array(idSchema).min(1),
  images: z.array(z.object({
    id: idSchema,
    filename: z.string(),
    originalname: z.string(),
    mimetype: z.string(),
    path: z.string(),
    isNew: z.boolean().optional().default(false),
  })).optional().default([]),
  uploadedImages: z.array(z.object({
    filename: z.string(),
    originalname: z.string(),
    mimetype: z.string(),
    path: z.string(),
  })).optional().default([]),
  uploadedImagesIds: z.array(idSchema).optional(),
  isAutoSyncEnabled: z.boolean().optional().default(false),
  syncSites: z.array(idSchema).optional().default([]),
})

export type EditProductRequest = z.input<typeof editProductSchema>

export const removeProductSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveProductRequest = z.input<typeof removeProductSchema>

export const duplicateProductSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type DuplicateProductRequest = z.input<typeof duplicateProductSchema>

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
    productProperties: z.array(z.object({
      id: idSchema,
      value: z.unknown(),
    })).optional(),
    unit: z.string().optional(),
    categories: z.array(idSchema).min(1).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional(),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.unknown(),
    }),
  ),
}).refine(hasIdsOrFilters, {
  message: 'Either ids or filters are required.',
})

export type BatchProductRequest = z.input<typeof batchProductSchema>

export const importProductsSchema = z.object({
  file: z.instanceof(File),
})

export type ImportProductsRequest = z.input<typeof importProductsSchema>

export const exportProductsSchema = z.object({
  ids: z.array(idSchema).min(1).optional(),
})

export type ExportProductsRequest = z.input<typeof exportProductsSchema>

export const getProductsResponseSchema = responseListSchema(productSchemaPopulated)
export type GetProductsResponse = z.output<typeof getProductsResponseSchema>

export const getProductIndexResponseSchema = responseSchema
export type GetProductIndexResponse = z.output<typeof getProductIndexResponseSchema> & { productIndex: number }

export const createProductResponseSchema = responseSchema
export type CreateProductResponse = z.output<typeof createProductResponseSchema>

export const editProductResponseSchema = responseSchema
export type EditProductResponse = z.output<typeof editProductResponseSchema>

export const removeProductResponseSchema = responseSchema
export type RemoveProductResponse = z.output<typeof removeProductResponseSchema>

export const batchProductResponseSchema = responseSchema
export type BatchProductResponse = z.output<typeof batchProductResponseSchema>

export const importProductsResponseSchema = responseSchema
export type ImportProductsResponse = z.output<typeof importProductsResponseSchema>

export const exportProductsResponseSchema = responseSchema
export type ExportProductsResponse = z.output<typeof exportProductsResponseSchema> & { buffer: Buffer }

export const downloadTemplateResponseSchema = responseSchema
export type DownloadTemplateResponse = z.output<typeof downloadTemplateResponseSchema> & { buffer: Buffer }
