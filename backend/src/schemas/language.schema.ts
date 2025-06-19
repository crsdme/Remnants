import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

function hasIdsOrFilters(data: {
  ids?: unknown
  filters?: unknown
}) {
  return !!data.ids || !!data.filters
}

export const getLanguageSchema = z.object({
  filters: z.object({
    name: z.string().trim().optional(),
    code: z.string().trim().optional(),
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
  pagination: paginationSchema.optional().default({}),
})

export const createLanguageSchema = z.object({
  name: z.string().trim(),
  code: z.string().trim(),
  priority: z.number().optional().default(0),
  main: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
})

export const editLanguageSchema = z.object({
  id: idSchema,
  name: z.string().trim(),
  code: z.string().trim(),
  priority: z.number().optional().default(0),
  main: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
})

export const removeLanguageSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const duplicateLanguageSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const batchLanguageSchema = z.object({
  ids: z.array(idSchema).optional(),
  filters: z.object({
    name: z.string().trim().optional(),
    code: z.string().trim().optional(),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    main: booleanArraySchema.optional(),
  }).optional().default({}),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ).min(1),
}).refine(hasIdsOrFilters, {
  message: 'Either ids or filters are required.',
})

export const importLanguagesSchema = z.object({
  file: z.instanceof(File),
})
