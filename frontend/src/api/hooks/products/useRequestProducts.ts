import type { getProductsParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/requests'

export function useRequestProducts(params: getProductsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'products',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getProducts(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
