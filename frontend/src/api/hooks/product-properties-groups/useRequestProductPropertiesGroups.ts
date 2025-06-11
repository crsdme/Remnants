import type { getProductPropertiesGroupsParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getProductPropertiesGroups } from '@/api/requests'

export function useRequestProductPropertiesGroups(params: getProductPropertiesGroupsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'product-properties-groups',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getProductPropertiesGroups(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
