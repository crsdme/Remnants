import type { getUsersParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/api/requests'

export function useUserQuery(params: getUsersParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['users', 'get', params],
    queryFn: () => getUsers(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
