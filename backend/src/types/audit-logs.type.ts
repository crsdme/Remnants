import type { AuditLogPopulatedDTO } from '@remnant/shared'
import type { z } from 'zod'
import type { auditLogDBSchema } from '../schemas'
import {
  createAuditLogsSchema,
  editAuditLogsSchema,
  getAuditLogsSchema,
  removeAuditLogsSchema,
} from '@remnant/shared'

export type AuditLogDB = z.infer<typeof auditLogDBSchema>

export type GetAuditLogsPayload = z.output<typeof getAuditLogsSchema>
export function parseGetAuditLogs(x: unknown): GetAuditLogsPayload {
  return getAuditLogsSchema.parse(x)
}

export type CreateAuditLogsPayload = z.output<typeof createAuditLogsSchema>
export function parseCreateAuditLogs(x: unknown): CreateAuditLogsPayload {
  return createAuditLogsSchema.parse(x)
}

export type EditAuditLogsPayload = z.output<typeof editAuditLogsSchema>
export function parseEditAuditLogs(x: unknown): EditAuditLogsPayload {
  return editAuditLogsSchema.parse(x)
}

export type RemoveAuditLogsPayload = z.output<typeof removeAuditLogsSchema>
export function parseRemoveAuditLogs(x: unknown): RemoveAuditLogsPayload {
  return removeAuditLogsSchema.parse(x)
}

export type GetAuditLogsRepoPayload = GetAuditLogsPayload
export interface GetAuditLogsRepoResult { items: AuditLogPopulatedDTO[], total: number, page: number, pageSize: number }

export type CreateAuditLogsRepoPayload = CreateAuditLogsPayload

export type EditAuditLogsRepoPayload = EditAuditLogsPayload

export type RemoveAuditLogsRepoPayload = RemoveAuditLogsPayload
