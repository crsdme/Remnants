import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getAuditLogsSchema = z.object({
  filters: z.object({
    ids: idSchema.array().optional(),
    resourceType: z.array(z.string().trim()).optional(),
    resourceId: z.array(z.string().trim()).optional(),
    action: z.array(z.string().trim()).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    resourceType: sorterParamsSchema.optional(),
    resourceId: sorterParamsSchema.optional(),
    action: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetAuditLogsRequest = z.input<typeof getAuditLogsSchema>

export const createAuditLogsSchema = z.object({
  resourceType: z.string(),
  resourceId: z.string(),
  action: z.string(),
  changes: z.array(z.object({
    path: z.string(),
    before: z.unknown(),
    after: z.unknown(),
  })),
  comment: z.string().optional(),
})

export type CreateAuditLogsRequest = z.input<typeof createAuditLogsSchema>

export const editAuditLogsSchema = z.object({
  id: idSchema,
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  action: z.string().optional(),
  changes: z.array(z.object({
    path: z.string(),
    before: z.unknown(),
    after: z.unknown(),
  })).optional(),
  comment: z.string().optional(),
})

export type EditAuditLogsRequest = z.input<typeof editAuditLogsSchema>

export const removeAuditLogsSchema = z.object({
  id: idSchema,
})

export type RemoveAuditLogsRequest = z.input<typeof removeAuditLogsSchema>
