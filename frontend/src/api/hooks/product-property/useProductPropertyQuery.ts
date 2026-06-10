import type { GetProductPropertyRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getProductProperties } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProductPropertyQuery(params: GetProductPropertyRequest, settings?: QuerySettings<typeof getProductProperties>) {
  const query = useQuery({
    queryKey: ['product-properties', 'get', params],
    queryFn: async () => getProductProperties(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const productProperties = query.data?.data?.data?.items ?? EMPTY_ITEMS
  const productPropertiesCount = query.data?.data?.data?.pagination?.total ?? 0

  return {
    ...query,
    productProperties,
    productPropertiesCount,
  }
}
