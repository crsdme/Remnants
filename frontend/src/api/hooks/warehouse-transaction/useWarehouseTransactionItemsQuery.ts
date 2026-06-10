import type { GetWarehouseTransactionsItemsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getWarehouseTransactionsItems } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useWarehouseTransactionItemsQuery(params: GetWarehouseTransactionsItemsRequest, settings?: QuerySettings<typeof getWarehouseTransactionsItems>) {
  const query = useQuery({
    queryKey: ['warehouse-transactions', 'get', 'items', params],
    queryFn: async () => getWarehouseTransactionsItems(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const warehouseTransactionItems = listData?.items ?? EMPTY_ITEMS
  const warehouseTransactionItemsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    warehouseTransactionItems,
    warehouseTransactionItemsCount,
  }
}
