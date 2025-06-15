import type { removeUserRolesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeUserRoles } from '@/api/requests'

export function useRemoveUserRoles(settings?: MutationSettings<removeUserRolesParams, typeof removeUserRoles>) {
  return useMutation({
    mutationFn: (params: removeUserRolesParams) => removeUserRoles(params),
    ...settings?.options,
  })
}
