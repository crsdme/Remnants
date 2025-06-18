import type { removeUserRolesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeUserRoles } from '@/api/requests'

export function useUserRoleRemove(settings?: MutationSettings<removeUserRolesParams, typeof removeUserRoles>) {
  return useMutation({
    mutationFn: removeUserRoles,
    ...settings?.options,
  })
}
