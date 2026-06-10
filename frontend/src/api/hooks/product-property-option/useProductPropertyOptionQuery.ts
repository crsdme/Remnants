import type { GetProductPropertyOptionRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getProductPropertiesOptions } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProductPropertyOptionQuery(params: GetProductPropertyOptionRequest, settings?: QuerySettings<typeof getProductPropertiesOptions>) {
  const query = useQuery({
    queryKey: ['product-properties-options', 'get', params],
    queryFn: async () => getProductPropertiesOptions(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const productPropertyOptions = listData?.items ?? EMPTY_ITEMS
  const productPropertyOptionsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    productPropertyOptions,
    productPropertyOptionsCount,
  }
}
