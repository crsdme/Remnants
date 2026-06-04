import { z } from 'zod'
import {
  booleanArraySchema,
  dateRangeSchema,
  idSchema,
  languageStringSchema,
  numberFromStringSchema,
  paginationSchema,
  sorterParamsSchema,
} from './common'

export const getUnitSchema = z.object({
  pagination: paginationSchema.optional(),
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
