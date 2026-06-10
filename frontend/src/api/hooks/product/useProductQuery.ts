import type { GetProductRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/requests'

/** Stable fallback so list identity does not change every render while loading. */
const EMPTY_ITEMS: never[] = []

export function useProductQuery(params: GetProductRequest, settings?: QuerySettings<typeof getProducts>) {
  const query = useQuery({
    queryKey: ['products', 'get', params],
    queryFn: async () => getProducts(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const products = query.data?.data?.data?.items ?? EMPTY_ITEMS
  const productsCount = query.data?.data?.data?.pagination?.total ?? 0

  return {
    ...query,
    products,
    productsCount,
  }
}
