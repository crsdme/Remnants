import type {
  AutomationDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type {
  automationActionDBSchema,
  automationConditionDBSchema,
  automationDBSchema,
  automationTriggerDBSchema,
} from '../schemas'
import {
  createAutomationSchema,
  editAutomationSchema,
  getAutomationsSchema,
  removeAutomationsSchema,
  runAutomationsSchema,
} from '@remnant/shared'

export type AutomationTriggerDB = z.infer<typeof automationTriggerDBSchema>

export type AutomationConditionDB = z.infer<typeof automationConditionDBSchema>

export type AutomationActionDB = z.infer<typeof automationActionDBSchema>

export type AutomationDB = z.infer<typeof automationDBSchema>

export type GetAutomationsPayload = z.output<typeof getAutomationsSchema>
export function parseGetAutomations(x: unknown): GetAutomationsPayload {
  return getAutomationsSchema.parse(x)
}

export type CreateAutomationPayload = z.output<typeof createAutomationSchema>
export function parseCreateAutomation(x: unknown): CreateAutomationPayload {
  return createAutomationSchema.parse(x)
}

export type EditAutomationPayload = z.output<typeof editAutomationSchema>
export function parseEditAutomation(x: unknown): EditAutomationPayload {
  return editAutomationSchema.parse(x)
}

export type RemoveAutomationsPayload = z.output<typeof removeAutomationsSchema>
export function parseRemoveAutomations(x: unknown): RemoveAutomationsPayload {
  return removeAutomationsSchema.parse(x)
}

export type RunAutomationsPayload = z.output<typeof runAutomationsSchema>
export function parseRunAutomations(x: unknown): RunAutomationsPayload {
  return runAutomationsSchema.parse(x)
}

export type GetAutomationsRepoPayload = GetAutomationsPayload
export interface GetAutomationsRepoResult { items: AutomationDTO[], total: number, page: number, pageSize: number }

export type CreateAutomationsRepoPayload = CreateAutomationPayload

export type EditAutomationsRepoPayload = EditAutomationPayload
