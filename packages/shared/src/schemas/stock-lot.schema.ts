import { z } from 'zod'
import {
  idSchema,
  idSchemaOptional,
  minorSchema,
  paginationSchema,
  responseListSchema,
  sorterParamsSchema,
  stringToBooleanSchema,
} from './common'

export const stockLotSchema = z.object({
  id: idSchema,
  productId: idSchema,
  warehouseId: idSchema,
  originalCount: z.number().int(),
  remainingCount: z.number().int(),
  minorUnitCost: minorSchema,
  currencyId: idSchema,
  receivedAt: z.coerce.date(),
  sourceMoveId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type StockLotDTO = z.output<typeof stockLotSchema>

export const getStockLotsSchema = z.object({
  filters: z.object({
    productId: idSchemaOptional,
    warehouseId: idSchemaOptional,
    /** When true, only lots with remainingCount > 0 */
    open: stringToBooleanSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    receivedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})
export type GetStockLotsRequest = z.input<typeof getStockLotsSchema>

export const getStockLotsResponseSchema = responseListSchema(stockLotSchema)
export type GetStockLotsResponse = z.output<typeof getStockLotsResponseSchema>
