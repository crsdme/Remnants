import type { GetWarehousesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getWarehouses } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useWarehouseQuery(params: GetWarehousesRequest, settings?: QuerySettings<typeof getWarehouses>) {
  const query = useQuery({
    queryKey: ['warehouses', 'get', params],
    queryFn: async () => getWarehouses(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const warehouses = listData?.items ?? EMPTY_ITEMS
  const warehousesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    warehouses,
    warehousesCount,
  }
}
