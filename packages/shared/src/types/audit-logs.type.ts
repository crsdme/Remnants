import type {
  IdType,
  ResponseItem,
  ResponseList,
} from './common.type'

interface AuditLogChange {
  path: string
  before: any
  after: any
}

export interface AuditLogDTO {
  id: IdType
  resourceType: string
  resourceId: string
  resource: any
  action: string
  changes: AuditLogChange[]
  comment: string
  createdAt: Date
  updatedAt: Date
}

export type GetAuditLogsResponse = ResponseList<AuditLogDTO>

export type CreateAuditLogsResponse = ResponseItem<AuditLogDTO>

export type EditAuditLogsResponse = ResponseItem<AuditLogDTO>
