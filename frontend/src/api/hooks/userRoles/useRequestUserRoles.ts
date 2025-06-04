import type { getUserRolesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getUserRoles } from '@/api/requests'

export function useRequestUserRoles(params: getUserRolesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'user-roles',
      'get',
      JSON.stringify(params.pagination),
      JSON.stringify(params.filters),
      JSON.stringify(params.sorters),
    ],
    queryFn: () => getUserRoles(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
