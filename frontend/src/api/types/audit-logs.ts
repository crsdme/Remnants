export interface getAuditLogsParams {
  filters: {
    ids?: string[]
    resourceType?: string[]
    resourceId?: string[]
    action?: string[]
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface AuditLogsResponse {
  status: string
  code: string
  message: string
  description: string
  auditLogs: AuditLog[]
  auditLogsCount: number
}
