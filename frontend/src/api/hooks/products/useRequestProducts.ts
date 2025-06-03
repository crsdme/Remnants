import type { GetProductsParams } from '@/api/requests'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/requests'

export function useRequestProducts(params: GetProductsParams) {
  return useSuspenseQuery({
    queryKey: ['products', 'get', params.pagination.current],
    queryFn: () => getProducts(params),
    staleTime: 60000,
  })
}
