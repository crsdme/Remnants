import type { getProductsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/requests'

export function useProductQuery(params: getProductsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['products', 'get', params],
    queryFn: () => getProducts(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
