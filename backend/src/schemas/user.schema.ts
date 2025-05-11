import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getUserSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    name: z.string().optional(),
    login: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional(),
  sorters: z.object({
    name: sorterParamsSchema.optional(),
    login: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
})

export const createUserSchema = z.object({
  name: z.string(),
  login: z.string(),
  password: z.string(),
  active: z.boolean().optional(),
})

export const editUserSchema = z.object({
  _id: idSchema,
  name: z.string(),
  login: z.string(),
  password: z.string(),
  active: z.boolean().optional(),
})

export const removeUserSchema = z.object({
  _ids: z.array(idSchema),
})

export const duplicateUserSchema = z.object({
  _ids: z.array(idSchema),
})

export const importUsersSchema = z.object({
  file: z.instanceof(File),
})
