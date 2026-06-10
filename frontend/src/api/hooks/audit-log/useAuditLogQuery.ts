import type { GetAuditLogsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useAuditLogQuery(params: GetAuditLogsRequest, settings?: QuerySettings<typeof getAuditLogs>) {
  const query = useQuery({
    queryKey: ['audit-logs', 'get', params],
    queryFn: async () => getAuditLogs(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const auditLogs = listData?.items ?? EMPTY_ITEMS
  const auditLogsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    auditLogs,
    auditLogsCount,
  }
}
