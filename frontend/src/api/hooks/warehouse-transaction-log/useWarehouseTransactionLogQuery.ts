import type { GetWarehouseTransactionLogsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getWarehouseTransactionsLogs } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useWarehouseTransactionLogQuery(params: GetWarehouseTransactionLogsRequest, settings?: QuerySettings<typeof getWarehouseTransactionsLogs>) {
  const query = useQuery({
    queryKey: ['warehouse-transactions-logs', 'get', params],
    queryFn: async () => getWarehouseTransactionsLogs(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const warehouseTransactionLogs = listData?.items ?? EMPTY_ITEMS
  const warehouseTransactionLogsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    warehouseTransactionLogs,
    warehouseTransactionLogsCount,
  }
}
