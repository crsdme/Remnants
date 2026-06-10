import type { GetUserRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useUserQuery(params: GetUserRequest, settings?: QuerySettings<typeof getUsers>) {
  const query = useQuery({
    queryKey: ['users', 'get', params],
    queryFn: async () => getUsers(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const users = listData?.items ?? EMPTY_ITEMS
  const usersCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    users,
    usersCount,
  }
}
