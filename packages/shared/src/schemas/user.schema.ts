import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getUserSchema = z.object({
  filters: z.object({
    name: z.string().optional(),
    login: z.string().optional(),
    role: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).default({}),
  sorters: z.object({
    name: sorterParamsSchema.optional(),
    login: sorterParamsSchema.optional(),
    role: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetUserRequest = z.input<typeof getUserSchema>

export const createUserSchema = z.object({
  name: z.string(),
  login: z.string(),
  password: z.string(),
  role: z.string(),
  active: z.boolean().optional(),
})

export type CreateUserRequest = z.input<typeof createUserSchema>

export const editUserSchema = z.object({
  id: idSchema,
  name: z.string(),
  login: z.string(),
  password: z.string().optional(),
  role: z.string(),
  active: z.boolean().optional(),
})

export type EditUserRequest = z.input<typeof editUserSchema>

export const removeUserSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveUserRequest = z.input<typeof removeUserSchema>
