import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from '@remnant/shared'
import { z } from 'zod'

export const productDBSchema = z.object({
  _id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  minorPrice: numberFromStringSchema,
  currencyId: idSchema,
  minorPurchasePrice: numberFromStringSchema,
  purchaseCurrencyId: idSchema,
  barcodesIds: z.array(idSchema),
  categoriesIds: z.array(idSchema),
  unitId: idSchema,
  images: z.array(z.object({
    filename: z.string(),
    name: z.string(),
    type: z.string(),
    path: z.string(),
  })),
  productPropertiesGroupId: idSchema,
  productProperties: z.array(z.object({
    id: idSchema,
    value: z.unknown(),
    data: z.object({
      id: idSchema,
      names: languageStringSchema,
      symbols: languageStringSchema,
      type: z.string(),
      isRequired: z.boolean(),
      showInTable: z.boolean(),
    }),
    options: z.array(z.object({
      id: idSchema,
      names: languageStringSchema,
      color: z.string().optional(),
    })),
  })),
  quantityIds: z.array(idSchema),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const productDBPopulatedSchema = z.object({
  _id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  minorPrice: numberFromStringSchema,
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
  }),
  minorPurchasePrice: numberFromStringSchema,
  purchaseCurrency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
  }),
  barcodes: z.array(z.object({
    id: idSchema,
    code: z.string(),
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
  images: z.array(z.object({
    filename: z.string(),
    name: z.string(),
    type: z.string(),
    path: z.string(),
  })),
  productPropertiesGroup: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  productProperties: z.array(z.object({
    _id: idSchema,
    value: z.unknown(),
    data: z.object({
      id: idSchema,
      names: languageStringSchema,
      symbols: languageStringSchema,
      type: z.string(),
      isRequired: z.boolean(),
      showInTable: z.boolean(),
    }),
    options: z.array(z.object({
      id: idSchema,
      names: languageStringSchema,
      color: z.string().optional(),
    })),
  })),
  warehouseStock: z.array(z.object({
    warehouse: idSchema,
    count: z.number(),
  })),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

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
  minorPrice: numberFromStringSchema,
  minorPurchasePrice: numberFromStringSchema,
  currencyId: z.string(),
  purchaseCurrencyId: z.string(),
  productPropertiesGroupId: z.string(),
  productProperties: z.array(z.object({
    _id: idSchema,
    value: z.unknown(),
  })),
  unitId: idSchema,
  categoriesIds: z.array(idSchema).min(1),
  images: z.array(z.object({
    filename: z.string(),
    path: z.string(),
  })).optional().default([]),
})

export const editProductRepoSchema = z.object({
  names: languageStringSchema,
  minorPrice: numberFromStringSchema,
  minorPurchasePrice: numberFromStringSchema,
  currencyId: z.string(),
  purchaseCurrencyId: z.string(),
  productPropertiesGroupId: z.string(),
  productProperties: z.array(z.object({
    _id: idSchema,
    value: z.unknown(),
  })),
  unitId: idSchema,
  categoriesIds: z.array(idSchema).min(1),
  images: z.array(z.object({
    filename: z.string(),
    path: z.string(),
  })).optional().default([]),
})
