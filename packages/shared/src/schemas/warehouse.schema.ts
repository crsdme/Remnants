import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

export const getWarehousesSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    active: booleanArraySchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    priority: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export type GetWarehousesRequest = z.input<typeof getWarehousesSchema>

export const createWarehousesSchema = z.object({
  names: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
})

export type CreateWarehousesRequest = z.input<typeof createWarehousesSchema>

export const editWarehousesSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export type EditWarehousesRequest = z.input<typeof editWarehousesSchema>

export const removeWarehousesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveWarehousesRequest = z.input<typeof removeWarehousesSchema>
