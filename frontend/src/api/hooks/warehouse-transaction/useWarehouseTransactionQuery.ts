import type { GetWarehouseTransactionsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getWarehouseTransactions } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useWarehouseTransactionQuery(params: GetWarehouseTransactionsRequest, settings?: QuerySettings<typeof getWarehouseTransactions>) {
  const query = useQuery({
    queryKey: ['warehouse-transactions', 'get', params],
    queryFn: async () => getWarehouseTransactions(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const warehouseTransactions = listData?.items ?? EMPTY_ITEMS
  const warehouseTransactionsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    warehouseTransactions,
    warehouseTransactionsCount,
  }
}
