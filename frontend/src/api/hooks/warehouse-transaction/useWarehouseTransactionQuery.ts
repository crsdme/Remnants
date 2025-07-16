import type { getWarehouseTransactionsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getWarehouseTransactions } from '@/api/requests'

export function useWarehouseTransactionQuery(params: getWarehouseTransactionsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['warehouse-transactions', 'get', params],
    queryFn: () => getWarehouseTransactions(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
