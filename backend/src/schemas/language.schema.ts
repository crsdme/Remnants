import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

function hasIdsOrFilters(data: {
  _ids?: unknown
  filters?: unknown
}) {
  return !!data._ids || !!data.filters
}

export const getLanguageSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
    main: booleanArraySchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    name: sorterParamsSchema.optional(),
    code: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    main: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export const createLanguageSchema = z.object({
  name: z.string(),
  code: z.string(),
  priority: z.number(),
  main: z.boolean().optional(),
  active: z.boolean().optional(),
})

export const editLanguageSchema = z.object({
  _id: idSchema,
  name: z.string(),
  code: z.string(),
  priority: numberFromStringSchema,
  main: z.boolean().optional(),
  active: z.boolean().optional(),
})

export const removeLanguageSchema = z.object({
  _ids: z.array(idSchema),
})

export const duplicateLanguageSchema = z.object({
  _ids: z.array(idSchema),
})

export const batchLanguageSchema = z.object({
  _ids: z.array(idSchema).optional(),
  filters: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    main: booleanArraySchema.optional(),
  }).optional(),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ),
}).refine(hasIdsOrFilters, {
  message: 'Either _ids or filters are required.',
})

export const importLanguagesSchema = z.object({
  file: z.instanceof(File),
})
