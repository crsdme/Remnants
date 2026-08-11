import { z } from 'zod'
import { dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { productSchemaPopulated } from './product.schema'

export const inventoryStatusSchema = z.enum(['draft', 'confirmed', 'cancelled'])
export type InventoryStatus = z.output<typeof inventoryStatusSchema>

export const inventoryConfirmModeSchema = z.enum(['counted_only', 'close_zone'])
export type InventoryConfirmMode = z.output<typeof inventoryConfirmModeSchema>

export const inventoryItemViewFilterSchema = z.enum(['all', 'uncounted', 'counted', 'mismatch'])
export type InventoryItemViewFilter = z.output<typeof inventoryItemViewFilterSchema>

const inventoryRelationSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
})

export const inventorySchema = z.object({
  id: idSchema,
  seq: z.number(),
  status: inventoryStatusSchema,
  warehouse: inventoryRelationSchema,
  categories: z.array(inventoryRelationSchema),
  comment: z.string().trim().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type InventoryDTO = z.output<typeof inventorySchema>

export const inventoryItemProductSchema = z.object({
  id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  barcodes: z.array(z.object({
    code: z.string(),
    id: idSchema,
  })).default([]),
  unit: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
  }).optional(),
  images: z.array(z.object({
    id: z.string().min(1),
    filename: z.string(),
    name: z.string(),
    type: z.string(),
    path: z.string(),
  })).default([]),
  stockStatus: z.object({
    id: idSchema,
    names: languageStringSchema,
    color: z.string().optional(),
  }).nullable().optional(),
})
export type InventoryItemProductDTO = z.output<typeof inventoryItemProductSchema>

export const inventoryItemSchema = z.object({
  id: idSchema,
  inventoryId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  receivedQuantity: z.number().nullable(),
  counted: z.boolean(),
  product: inventoryItemProductSchema.optional(),
})
export type InventoryItemDTO = z.output<typeof inventoryItemSchema>

export const inventoryProgressSchema = z.object({
  total: z.number(),
  counted: z.number(),
  uncounted: z.number(),
  mismatches: z.number(),
})
export type InventoryProgressDTO = z.output<typeof inventoryProgressSchema>

export const getInventoriesSchema = z.object({
  filters: z.object({
    seq: z.string().optional(),
    status: inventoryStatusSchema.optional(),
    warehouseId: idSchemaOptional,
    category: idSchemaOptional,
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    seq: sorterParamsSchema.optional(),
    status: sorterParamsSchema.optional(),
    warehouseId: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetInventoriesRequest = z.input<typeof getInventoriesSchema>

export const createInventorySchema = z.object({
  warehouseId: idSchema,
  categories: z.array(idSchema).min(1),
  comment: z.string().trim().optional(),
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number().optional(),
    receivedQuantity: z.number().nullable().optional(),
  })).optional().default([]),
})

export type CreateInventoryRequest = z.input<typeof createInventorySchema>

export const removeInventoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveInventoriesRequest = z.input<typeof removeInventoriesSchema>

export const getInventoryItemsSchema = z.object({
  filters: z.object({
    inventoryId: idSchemaOptional,
    view: inventoryItemViewFilterSchema.optional().default('all'),
    search: z.string().optional().transform(val => val?.trim() === '' ? undefined : val),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetInventoryItemsRequest = z.input<typeof getInventoryItemsSchema>

export const getInventoryProgressSchema = z.object({
  filters: z.object({
    inventoryId: idSchema,
  }),
})

export type GetInventoryProgressRequest = z.input<typeof getInventoryProgressSchema>

export const editInventorySchema = z.object({
  warehouseId: idSchema.optional(),
  categories: z.array(idSchema).min(1).optional(),
  id: idSchema,
  status: inventoryStatusSchema.optional(),
  comment: z.string().trim().optional(),
})

export type EditInventoryRequest = z.input<typeof editInventorySchema>

export const upsertInventoryItemSchema = z.object({
  inventoryId: idSchema,
  productId: idSchema,
  receivedQuantity: z.number(),
})

export type UpsertInventoryItemRequest = z.input<typeof upsertInventoryItemSchema>

export const confirmInventorySchema = z.object({
  id: idSchema,
  mode: inventoryConfirmModeSchema,
})

export type ConfirmInventoryRequest = z.input<typeof confirmInventorySchema>

export const scanBarcodeToDraftsSchema = z.object({
  filters: z.object({
    barcode: z.string().trim().min(1),
    inventoryId: idSchema,
    category: idSchemaOptional,
  }),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export type ScanBarcodeToDraftsRequest = z.input<typeof scanBarcodeToDraftsSchema>

export const scanBarcodeToDraftInventorySchema = z.object({
  barcode: z.string().trim(),
  inventoryId: idSchema,
  category: idSchemaOptional,
})

export type ScanBarcodeToDraftInventoryRequest = z.input<typeof scanBarcodeToDraftInventorySchema>

export const getInventoriesResponseSchema = responseListSchema(inventorySchema)
export type GetInventoriesResponse = z.output<typeof getInventoriesResponseSchema>

export const createInventoryResponseSchema = responseItemSchema(inventorySchema)
export type CreateInventoryResponse = z.output<typeof createInventoryResponseSchema>

export const editInventoryResponseSchema = responseItemSchema(inventorySchema)
export type EditInventoryResponse = z.output<typeof editInventoryResponseSchema>

export const removeInventoriesResponseSchema = responseSchema
export type RemoveInventoriesResponse = z.output<typeof removeInventoriesResponseSchema>

export const getInventoryItemsResponseSchema = responseListSchema(inventoryItemSchema)
export type GetInventoryItemsResponse = z.output<typeof getInventoryItemsResponseSchema>

export const getInventoryProgressResponseSchema = responseItemSchema(inventoryProgressSchema)
export type GetInventoryProgressResponse = z.output<typeof getInventoryProgressResponseSchema>

export const upsertInventoryItemResponseSchema = responseItemSchema(inventoryItemSchema).extend({
  progress: inventoryProgressSchema,
})
export type UpsertInventoryItemResponse = z.output<typeof upsertInventoryItemResponseSchema>

export const confirmInventoryResponseSchema = responseItemSchema(inventorySchema)
export type ConfirmInventoryResponse = z.output<typeof confirmInventoryResponseSchema>

export const scanBarcodeToDraftInventoryResponseSchema = responseSchema.extend({
  product: productSchemaPopulated,
  productIndex: z.number().optional(),
  inventoryId: idSchemaOptional,
  item: inventoryItemSchema.optional(),
  unitsPerScan: z.number().int().positive().optional().default(1),
})
export type ScanBarcodeToDraftInventoryResponse = z.output<typeof scanBarcodeToDraftInventoryResponseSchema>

export const exportInventorySchema = z.object({
  id: idSchema,
  language: z.string().optional().default('ru'),
  view: inventoryItemViewFilterSchema.optional().default('all'),
})
export type ExportInventoryRequest = z.input<typeof exportInventorySchema>
