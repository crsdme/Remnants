import type {
  AuditLogsResponse,
  getAuditLogsParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getAuditLogs(params: getAuditLogsParams) {
  return api.get<AuditLogsResponse>('audit-logs/get', { params })
}
