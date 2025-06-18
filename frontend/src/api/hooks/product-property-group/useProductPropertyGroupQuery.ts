import type { getProductPropertiesGroupsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getProductPropertiesGroups } from '@/api/requests'

export function useProductPropertyGroupQuery(params: getProductPropertiesGroupsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['product-properties-groups', 'get', params],
    queryFn: () => getProductPropertiesGroups(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
