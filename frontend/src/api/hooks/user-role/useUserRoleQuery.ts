import type { getUserRolesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getUserRoles } from '@/api/requests'

export function useUserRoleQuery(params: getUserRolesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['user-roles', 'get', params],
    queryFn: () => getUserRoles(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
