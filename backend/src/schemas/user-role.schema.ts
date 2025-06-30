import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getUserRoleSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    names: z.string().optional(),
    permissions: z.string().optional(),
    priority: z.number().optional(),
    active: booleanArraySchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    permissions: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export const createUserRoleSchema = z.object({
  names: languageStringSchema,
  permissions: z.array(z.string()).min(1),
  priority: z.number(),
  active: z.boolean().optional(),
})

export const editUserRoleSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  permissions: z.array(z.string()).min(1),
  priority: z.number(),
  active: z.boolean().optional(),
})

export const removeUserRoleSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const duplicateUserRoleSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const importUserRolesSchema = z.object({
  file: z.instanceof(File),
})
