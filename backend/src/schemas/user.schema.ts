import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getUserSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    name: z.string().optional(),
    login: z.string().optional(),
    role: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    name: sorterParamsSchema.optional(),
    login: sorterParamsSchema.optional(),
    role: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export const createUserSchema = z.object({
  name: z.string(),
  login: z.string(),
  password: z.string(),
  role: z.string(),
  active: z.boolean().optional(),
})

export const editUserSchema = z.object({
  id: idSchema,
  name: z.string(),
  login: z.string(),
  password: z.string().optional(),
  role: z.string(),
  active: z.boolean().optional(),
})

export const removeUserSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const duplicateUserSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const importUsersSchema = z.object({
  file: z.instanceof(File),
})
