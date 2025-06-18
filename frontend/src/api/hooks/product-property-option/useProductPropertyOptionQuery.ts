import type { getProductPropertiesOptionsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getProductPropertiesOptions } from '@/api/requests'

export function useProductPropertyOptionQuery(params: getProductPropertiesOptionsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['product-properties-options', 'get', params],
    queryFn: () => getProductPropertiesOptions(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
