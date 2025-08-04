import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getSitesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    url: z.string().trim().optional(),
    key: z.string().trim().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    url: sorterParamsSchema.optional(),
    key: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createSiteSchema = z.object({
  names: languageStringSchema,
  url: z.string().trim(),
  key: z.string().trim(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  warehouses: z.array(idSchema).optional().default([]),
})

export const editSiteSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  url: z.string().trim(),
  key: z.string().trim(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  warehouses: z.array(idSchema).optional().default([]),
})

export const removeSitesSchema = z.object({
  ids: z.array(idSchema).min(1),
})
