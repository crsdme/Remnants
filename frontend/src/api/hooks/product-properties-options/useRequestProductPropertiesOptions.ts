import type { getProductPropertiesOptionsParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getProductPropertiesOptions } from '@/api/requests'

export function useRequestProductPropertiesOptions(params: getProductPropertiesOptionsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'product-properties-options',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getProductPropertiesOptions(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
