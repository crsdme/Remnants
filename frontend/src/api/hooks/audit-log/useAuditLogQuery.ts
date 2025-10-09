import type { getAuditLogsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/requests'

export function useAuditLogQuery(params: getAuditLogsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['audit-logs', 'get', params],
    queryFn: () => getAuditLogs(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
