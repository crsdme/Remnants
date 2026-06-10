import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const warehouseSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type WarehouseDTO = z.infer<typeof warehouseSchema>

export const getWarehousesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    active: booleanArraySchema.optional(),
    language: z.string().optional().default('en'),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    priority: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetWarehousesRequest = z.input<typeof getWarehousesSchema>

export const createWarehousesSchema = z.object({
  names: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
})

export type CreateWarehouseRequest = z.input<typeof createWarehousesSchema>

export const editWarehousesSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export type EditWarehouseRequest = z.input<typeof editWarehousesSchema>

export const removeWarehousesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveWarehousesRequest = z.input<typeof removeWarehousesSchema>

export const getWarehousesResponseSchema = responseListSchema(warehouseSchema)
export type GetWarehousesResponse = z.infer<typeof getWarehousesResponseSchema>

export const createWarehousesResponseSchema = responseItemSchema(warehouseSchema)
export type CreateWarehousesResponse = z.infer<typeof createWarehousesResponseSchema>

export const editWarehousesResponseSchema = responseItemSchema(warehouseSchema)
export type EditWarehousesResponse = z.infer<typeof editWarehousesResponseSchema>

export const removeWarehousesResponseSchema = responseSchema
export type RemoveWarehousesResponse = z.infer<typeof removeWarehousesResponseSchema>
