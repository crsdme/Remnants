import type { GetProductPropertyGroupRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getProductPropertyGroups } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProductPropertyGroupQuery(params: GetProductPropertyGroupRequest, settings?: QuerySettings<typeof getProductPropertyGroups>) {
  const query = useQuery({
    queryKey: ['product-properties-groups', 'get', params],
    queryFn: async () => getProductPropertyGroups(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const productPropertyGroups = listData?.items ?? EMPTY_ITEMS
  const productPropertyGroupsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    productPropertyGroups,
    productPropertyGroupsCount,
  }
}
