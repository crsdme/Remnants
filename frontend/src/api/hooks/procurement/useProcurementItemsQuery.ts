import type { GetProcurementItemsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getProcurementItems } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProcurementItemsQuery(params: GetProcurementItemsRequest, settings?: QuerySettings<typeof getProcurementItems>) {
  const query = useQuery({
    queryKey: ['procurements', 'get', 'items', params],
    queryFn: async () => getProcurementItems(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const procurementItems = listData?.items ?? EMPTY_ITEMS
  const procurementItemsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    procurementItems,
    procurementItemsCount,
  }
}
