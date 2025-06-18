import type { getProductPropertiesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getProductProperties } from '@/api/requests'

export function useProductPropertyQuery(params: getProductPropertiesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['product-properties', 'get', params],
    queryFn: () => getProductProperties(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
