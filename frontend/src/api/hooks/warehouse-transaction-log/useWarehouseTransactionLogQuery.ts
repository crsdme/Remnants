import type { getWarehouseTransactionsLogsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getWarehouseTransactionsLogs } from '@/api/requests'

export function useWarehouseTransactionLogQuery(params: getWarehouseTransactionsLogsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['warehouse-transactions-logs', 'get', params],
    queryFn: () => getWarehouseTransactionsLogs(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
