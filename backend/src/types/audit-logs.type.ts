import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface AuditLog {
  id: IdType
  resourceType: string
  resourceId: string
  action: string
  changes: {
    path: string
    before: any
    after: any
  }[]
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface getAuditLogsResult {
  status: Status
  code: Code
  message: Message
  auditLogs: AuditLog[]
  auditLogsCount: number
}

export interface getAuditLogsFilters {
  ids: IdType[]
  resourceType: string[]
  resourceId: string[]
  action: string[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getAuditLogsSorters {
  resourceType: Sorter
  resourceId: Sorter
  action: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getAuditLogsParams {
  filters?: Partial<getAuditLogsFilters>
  sorters?: Partial<getAuditLogsSorters>
  pagination?: Partial<Pagination>
}

export interface createAuditLogsResult {
  status: Status
  code: Code
  message: Message
  auditLog: AuditLog
}

export interface createAuditLogsParams {
  resourceType: string
  resourceId: string
  action: string
  changes: {
    path: string
    before: any
    after: any
  }[]
  comment?: string
}

export interface editAuditLogsResult {
  status: Status
  code: Code
  message: Message
  auditLog: AuditLog
}

export interface editAuditLogsParams {
  id: IdType
  resourceType: string
  resourceId: string
  action: string
  changes: {
    path: string
    before: any
    after: any
  }[]
  comment?: string
}
