import { z } from 'zod'
import { dateRangeSchema, idSchema, idSchemaOptional, paginationSchema, responseItemSchema, responseListSchema, sorterParamsSchema } from './common'

export const auditLogChangeSchema = z.object({
  path: z.string(),
  before: z.unknown(),
  after: z.unknown(),
})

export type AuditLogChange = z.output<typeof auditLogChangeSchema>

export const auditLogSchema = z.object({
  id: idSchema,
  resourceType: z.string(),
  resourceId: idSchema,
  resource: z.unknown(),
  action: z.string(),
  changes: z.array(auditLogChangeSchema),
  comment: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AuditLogDTO = z.output<typeof auditLogSchema>

export const auditLogPopulatedSchema = z.object({
  id: idSchema,
  resourceType: z.string(),
  resourceId: idSchema,
  resource: z.unknown(),
  action: z.string(),
  changes: z.array(auditLogChangeSchema),
  comment: z.string(),
  createdBy: z.object({
    id: idSchema,
    name: z.string().trim(),
  }).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AuditLogPopulatedDTO = z.output<typeof auditLogPopulatedSchema>

export const getAuditLogsSchema = z.object({
  filters: z.object({
    ids: idSchema.array().optional(),
    resourceType: z.array(z.string().trim()).optional(),
    resourceId: z.array(idSchema).optional(),
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
  resourceId: idSchema,
  action: z.string(),
  changes: z.array(z.object({
    path: z.string(),
    before: z.unknown(),
    after: z.unknown(),
  })),
  comment: z.string().optional(),
  createdBy: idSchema.optional(),
})

export type CreateAuditLogsRequest = z.input<typeof createAuditLogsSchema>

export const editAuditLogsSchema = z.object({
  id: idSchema,
  resourceType: z.string().optional(),
  resourceId: idSchemaOptional,
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

export const getAuditLogsResponseSchema = responseListSchema(auditLogPopulatedSchema)
export type GetAuditLogsResponse = z.output<typeof getAuditLogsResponseSchema>

export const createAuditLogsResponseSchema = responseItemSchema(auditLogSchema)
export type CreateAuditLogsResponse = z.output<typeof createAuditLogsResponseSchema>

export const editAuditLogsResponseSchema = responseItemSchema(auditLogSchema)
export type EditAuditLogsResponse = z.output<typeof editAuditLogsResponseSchema>
