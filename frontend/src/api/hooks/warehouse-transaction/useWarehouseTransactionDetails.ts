import type { GetWarehouseTransactionDetailsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getWarehouseTransactionDetails } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useWarehouseTransactionDetails(params: GetWarehouseTransactionDetailsRequest, settings?: QuerySettings<typeof getWarehouseTransactionDetails>) {
  const query = useQuery({
    queryKey: ['warehouse-transactions', 'get', params],
    queryFn: async () => getWarehouseTransactionDetails(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const warehouseTransaction = listData?.warehouseTransaction ?? null
  const warehouseTransactionItems = listData?.warehouseTransactionItems ?? EMPTY_ITEMS

  return {
    ...query,
    warehouseTransaction,
    warehouseTransactionItems,
  }
}
