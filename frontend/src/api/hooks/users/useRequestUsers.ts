import type { getUsersParams } from '@/api/requests'

import { getUsers } from '@/api/requests'
import { useQuery } from '@tanstack/react-query'

export function useRequestUsers(params: getUsersParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'users',
      'get',
      JSON.stringify(params.pagination),
      JSON.stringify(params.filters),
      JSON.stringify(params.sorters),
    ],
    queryFn: () => getUsers(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
