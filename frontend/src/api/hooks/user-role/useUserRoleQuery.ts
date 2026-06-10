import type { GetUserRoleRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getUserRoles } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useUserRoleQuery(params: GetUserRoleRequest, settings?: QuerySettings<typeof getUserRoles>) {
  const query = useQuery({
    queryKey: ['user-roles', 'get', params],
    queryFn: async () => getUserRoles(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const userRoles = listData?.items ?? EMPTY_ITEMS
  const userRolesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    userRoles,
    userRolesCount,
  }
}
