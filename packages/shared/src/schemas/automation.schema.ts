import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getAutomationsSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    trigger: z.string().trim().optional(),
    conditions: z.array(z.string().trim()).optional(),
    actions: z.array(z.string().trim()).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).default({}),
  sorters: z.object({
    trigger: sorterParamsSchema.optional(),
    conditions: sorterParamsSchema.optional(),
    actions: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetAutomationsParams = z.infer<typeof getAutomationsSchema>

export const createAutomationSchema = z.object({
  name: z.string().trim(),
  trigger: z.object({
    type: z.string().trim(),
    params: z.array(z.string().trim()),
  }),
  conditions: z.array(z.object({
    field: z.string().trim(),
    operator: z.string().trim(),
    params: z.array(z.string().trim()),
  })),
  actions: z.array(z.object({
    field: z.string().trim(),
    params: z.array(z.string().trim()),
  })),
  active: z.boolean().optional().default(true),
})

export type CreateAutomationParams = z.infer<typeof createAutomationSchema>

export const editAutomationSchema = z.object({
  id: idSchema,
  name: z.string().trim(),
  trigger: z.object({
    type: z.string().trim(),
    params: z.array(z.string().trim()),
  }),
  conditions: z.array(z.object({
    field: z.string().trim(),
    operator: z.string().trim(),
    params: z.array(z.string().trim()),
  })),
  actions: z.array(z.object({
    field: z.string().trim(),
    params: z.array(z.string().trim()),
  })),
  active: z.boolean().optional().default(true),
})

export type EditAutomationParams = z.infer<typeof editAutomationSchema>

export const removeAutomationsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveAutomationsParams = z.infer<typeof removeAutomationsSchema>

export const runAutomationsSchema = z.object({
  type: z.enum(['order-created', 'order-updated', 'order-removed']),
  entityId: idSchema,
  user: idSchema,
})

export type RunAutomationsParams = z.infer<typeof runAutomationsSchema>
