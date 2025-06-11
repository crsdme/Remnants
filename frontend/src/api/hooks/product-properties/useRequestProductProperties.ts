import type { getProductPropertiesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getProductProperties } from '@/api/requests'

export function useRequestProductProperties(params: getProductPropertiesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'product-properties',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getProductProperties(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
