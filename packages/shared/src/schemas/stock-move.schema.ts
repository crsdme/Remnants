import { z } from 'zod'
import {
  dateRangeSchema,
  idSchema,
  idSchemaOptional,
  languageStringSchema,
  minorSchema,
  paginationSchema,
  responseListSchema,
  sorterParamsSchema,
} from './common'

export const stockLocationKindSchema = z.enum([
  'warehouse',
  'supplier',
  'customer',
  'transit',
  'adjustment',
])
export type StockLocationKind = z.output<typeof stockLocationKindSchema>

export const stockDocumentTypeSchema = z.enum([
  'order',
  'warehouse-transaction',
  'inventory',
  'procurement',
  'migration',
])
export type StockDocumentType = z.output<typeof stockDocumentTypeSchema>

export const stockMoveLayerSchema = z.object({
  lotId: idSchema,
  quantity: z.number().int().positive(),
  minorUnitCost: minorSchema,
  currencyId: idSchema,
  receivedAt: z.coerce.date(),
})
export type StockMoveLayerDTO = z.output<typeof stockMoveLayerSchema>

export const stockMoveSchema = z.object({
  id: idSchema,
  productId: idSchema,
  fromKind: stockLocationKindSchema,
  toKind: stockLocationKindSchema,
  fromWarehouseId: idSchema.nullable().optional(),
  toWarehouseId: idSchema.nullable().optional(),
  quantity: z.number().int().positive(),
  openQuantity: z.number().int().nonnegative(),
  layers: z.array(stockMoveLayerSchema),
  documentType: stockDocumentTypeSchema,
  documentId: idSchema,
  documentItemId: idSchema.nullable().optional(),
  userId: idSchemaOptional,
  cancelled: z.boolean(),
  cancelledAt: z.coerce.date().nullable().optional(),
  cancelledBy: idSchema.nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type StockMoveDTO = z.output<typeof stockMoveSchema>

export const stockMovePopulatedSchema = stockMoveSchema.extend({
  fromWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).nullable().optional(),
  toWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).nullable().optional(),
  user: z.object({
    id: idSchema,
    name: z.string(),
  }).nullable().optional(),
  documentSeq: z.number().nullable().optional(),
})
export type StockMovePopulatedDTO = z.output<typeof stockMovePopulatedSchema>

export const getStockMovesSchema = z.object({
  filters: z.object({
    productId: idSchemaOptional,
    warehouseId: idSchemaOptional,
    documentType: stockDocumentTypeSchema.optional(),
    documentId: idSchemaOptional,
    userId: idSchemaOptional,
    createdAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})
export type GetStockMovesRequest = z.input<typeof getStockMovesSchema>

export const getStockMovesResponseSchema = responseListSchema(stockMovePopulatedSchema)
export type GetStockMovesResponse = z.output<typeof getStockMovesResponseSchema>
