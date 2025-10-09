import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getAuditLogsSchema = z.object({
  filters: z.object({
    id: idSchema.optional(),
    resourceType: z.string().trim().optional(),
    resourceId: z.string().trim().optional(),
    action: z.string().trim().optional(),
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
