import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const automationTriggerDBSchema = z.object({
  type: z.string(),
  params: z.array(z.string()),
})

export const automationConditionDBSchema = z.object({
  field: z.string(),
  operator: z.string(),
  params: z.unknown(),
})

export const automationActionDBSchema = z.object({
  field: z.string(),
  params: z.unknown(),
})

export const automationDBSchema = z.object({
  _id: idSchema,
  name: z.string(),
  trigger: automationTriggerDBSchema,
  conditions: z.array(automationConditionDBSchema),
  actions: z.array(automationActionDBSchema),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
