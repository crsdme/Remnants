import type { AuditLogDTO } from '@remnant/shared'
import type { z } from 'zod'
import {
  createAuditLogsSchema,
  editAuditLogsSchema,
  getAuditLogsSchema,
  removeAuditLogsSchema,
} from '@remnant/shared'

export interface AuditLogDB {
  _id: string
  resourceType: string
  resourceId: string
  action: string
  changes: { path: string, before: unknown, after: unknown }[]
  comment?: string
  createdAt: Date
  updatedAt: Date
  resource?: unknown
}

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
export interface GetAuditLogsRepoResult { items: AuditLogDTO[], total: number, page: number, pageSize: number }

export type CreateAuditLogsRepoPayload = CreateAuditLogsPayload

export type EditAuditLogsRepoPayload = EditAuditLogsPayload

export type RemoveAuditLogsRepoPayload = RemoveAuditLogsPayload
