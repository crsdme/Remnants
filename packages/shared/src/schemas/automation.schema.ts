import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const automationTriggerSchema = z.object({
  type: z.string().trim(),
  params: z.unknown().optional(),
})

export type AutomationTrigger = z.output<typeof automationTriggerSchema>

export const automationConditionSchema = z.object({
  field: z.string().trim(),
  operator: z.string().trim(),
  params: z.unknown().optional(),
})

export type AutomationCondition = z.output<typeof automationConditionSchema>

export const automationActionSchema = z.object({
  field: z.string().trim(),
  params: z.unknown().optional(),
})

export type AutomationAction = z.output<typeof automationActionSchema>

export const automationSchema = z.object({
  id: idSchema,
  name: z.string().trim(),
  trigger: automationTriggerSchema,
  conditions: z.array(automationConditionSchema),
  actions: z.array(automationActionSchema),
  active: z.boolean().optional().default(true),
  removed: z.boolean().optional().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AutomationDTO = z.output<typeof automationSchema>

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

export type GetAutomationsRequest = z.input<typeof getAutomationsSchema>

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

export type CreateAutomationRequest = z.input<typeof createAutomationSchema>

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

export type EditAutomationRequest = z.input<typeof editAutomationSchema>

export const removeAutomationsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveAutomationsRequest = z.input<typeof removeAutomationsSchema>

export const runAutomationsSchema = z.object({
  type: z.enum(['order-created', 'order-updated', 'order-removed']),
  entityId: idSchema,
  user: idSchema,
})

export type RunAutomationsRequest = z.input<typeof runAutomationsSchema>

export const getAutomationsResponseSchema = responseListSchema(automationSchema)
export type GetAutomationsResponse = z.output<typeof getAutomationsResponseSchema>

export const createAutomationResponseSchema = responseItemSchema(automationSchema)
export type CreateAutomationResponse = z.output<typeof createAutomationResponseSchema>

export const editAutomationResponseSchema = responseItemSchema(automationSchema)
export type EditAutomationResponse = z.output<typeof editAutomationResponseSchema>

export const removeAutomationsResponseSchema = responseSchema
export type RemoveAutomationsResponse = z.output<typeof removeAutomationsResponseSchema>

export const runAutomationsResponseSchema = responseSchema
export type RunAutomationsResponse = z.output<typeof runAutomationsResponseSchema>
