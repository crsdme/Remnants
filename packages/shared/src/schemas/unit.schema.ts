import { z } from 'zod'
import {
  booleanArraySchema,
  dateRangeSchema,
  idSchema,
  languageStringSchema,
  numberFromStringSchema,
  paginationSchema,
  responseItemSchema,
  responseListSchema,
  responseSchema,
  sorterParamsSchema,
} from './common'

export const unitSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UnitDTO = z.output<typeof unitSchema>

export const getUnitSchema = z.object({
  filters: z.object({
    names: z.string().optional(),
    symbols: z.string().optional(),
    language: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    symbols: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetUnitRequest = z.input<typeof getUnitSchema>

export const createUnitSchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
})

export type CreateUnitRequest = z.input<typeof createUnitSchema>

export const editUnitSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export type EditUnitRequest = z.input<typeof editUnitSchema>

export const removeUnitSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveUnitRequest = z.input<typeof removeUnitSchema>

export const getUnitsResponseSchema = responseListSchema(unitSchema)
export type GetUnitsResponse = z.output<typeof getUnitsResponseSchema>

export const createUnitResponseSchema = responseItemSchema(unitSchema)
export type CreateUnitResponse = z.output<typeof createUnitResponseSchema>

export const editUnitResponseSchema = responseItemSchema(unitSchema)
export type EditUnitResponse = z.output<typeof editUnitResponseSchema>

export const removeUnitsResponseSchema = responseSchema
export type RemoveUnitsResponse = z.output<typeof removeUnitsResponseSchema>
