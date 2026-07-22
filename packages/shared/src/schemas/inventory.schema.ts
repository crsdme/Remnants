import { z } from 'zod'
import { dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { productSchema } from './product.schema'

export const inventoryStatusSchema = z.enum(['draft', 'confirmed', 'awaiting', 'received', 'cancelled'])
export type InventoryStatus = z.output<typeof inventoryStatusSchema>

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

export const inventoryItemSchema = z.object({
  id: idSchema,
  inventoryId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  receivedQuantity: z.number(),
})
export type InventoryItemDTO = z.output<typeof inventoryItemSchema>

export const getInventoriesSchema = z.object({
  filters: z.object({
    seq: z.string().optional(),
    status: inventoryStatusSchema.optional(),
    warehouse: idSchemaOptional,
    category: idSchemaOptional,
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    seq: sorterParamsSchema.optional(),
    status: sorterParamsSchema.optional(),
    warehouse: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetInventoriesRequest = z.input<typeof getInventoriesSchema>

export const createInventorySchema = z.object({
  warehouse: idSchema,
  categories: z.array(idSchema).min(1),
  comment: z.string().trim().optional(),
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    receivedQuantity: z.number(),
  })),
})

export type CreateInventoryRequest = z.input<typeof createInventorySchema>

export const removeInventoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveInventoriesRequest = z.input<typeof removeInventoriesSchema>

export const getInventoryItemsSchema = z.object({
  filters: z.object({
    inventoryId: idSchemaOptional,
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetInventoryItemsRequest = z.input<typeof getInventoryItemsSchema>

export const editInventorySchema = z.object({
  warehouse: idSchema,
  categories: z.array(idSchema).min(1),
  id: idSchema,
  status: inventoryStatusSchema.optional(),
  comment: z.string().trim().optional(),
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    receivedQuantity: z.number(),
  })),
})

export type EditInventoryRequest = z.input<typeof editInventorySchema>

export const scanBarcodeToDraftsSchema = z.object({
  filters: z.object({
    barcode: z.string().trim(),
    category: idSchema,
    inventoryId: idSchemaOptional,
  }),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export type ScanBarcodeToDraftsRequest = z.input<typeof scanBarcodeToDraftsSchema>

export const scanBarcodeToDraftInventorySchema = z.object({
  barcode: z.string().trim(),
  category: idSchema,
  inventoryId: idSchemaOptional,
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

export const receiveInventoryResponseSchema = responseSchema
export type ReceiveInventoryResponse = z.output<typeof receiveInventoryResponseSchema>

export const scanBarcodeToDraftInventoryResponseSchema = z.object({
  product: productSchema,
  productIndex: z.number().optional(),
  inventoryId: idSchemaOptional,
})
export type ScanBarcodeToDraftInventoryResponse = z.output<typeof scanBarcodeToDraftInventoryResponseSchema>
