import type {
  GetAuditLogsRequest,
  GetAuditLogsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getAuditLogs(params: GetAuditLogsRequest) {
  return api.get<GetAuditLogsResponse>('audit-logs/get', { params })
}
