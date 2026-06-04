import type {
  AuditLogsResponse,
  getAuditLogsParams,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getAuditLogs(params: getAuditLogsParams) {
  return api.get<AuditLogsResponse>('audit-logs/get', { params })
}
