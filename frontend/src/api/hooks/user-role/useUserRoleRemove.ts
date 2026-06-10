import type { RemoveUserRoleRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeUserRoles } from '@/api/requests'

export function useUserRoleRemove(settings?: MutationSettings<RemoveUserRoleRequest>) {
  return useMutation({
    mutationFn: removeUserRoles,
    ...settings?.options,
  })
}
