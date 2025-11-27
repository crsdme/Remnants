import type { getProcurementItemsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getProcurementItems } from '@/api/requests'

export function useProcurementItemsQuery(params: getProcurementItemsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['procurements', 'get', 'items', params],
    queryFn: () => getProcurementItems(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
