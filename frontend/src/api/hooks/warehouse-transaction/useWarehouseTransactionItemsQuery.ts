import type { getWarehouseTransactionsItemsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getWarehouseTransactionsItems } from '@/api/requests'

export function useWarehouseTransactionItemsQuery(params: getWarehouseTransactionsItemsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['warehouse-transactions', 'get', 'items', params],
    queryFn: () => getWarehouseTransactionsItems(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
