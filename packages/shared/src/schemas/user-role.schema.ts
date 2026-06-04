import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, paginationSchema, sorterParamsSchema } from './common'

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

export type GetUserRoleRequest = z.input<typeof getUserRoleSchema>

export const createUserRoleSchema = z.object({
  names: languageStringSchema,
  permissions: z.array(z.string()).min(1),
  priority: z.number(),
  active: z.boolean().optional(),
})

export type CreateUserRoleRequest = z.input<typeof createUserRoleSchema>

export const editUserRoleSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  permissions: z.array(z.string()).min(1),
  priority: z.number(),
  active: z.boolean().optional(),
})

export type EditUserRoleRequest = z.input<typeof editUserRoleSchema>

export const removeUserRoleSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveUserRoleRequest = z.input<typeof removeUserRoleSchema>
