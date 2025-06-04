import type { duplicateUserRolesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { duplicateUserRoles } from '@/api/requests'

export function useDuplicateUserRoles(settings?: MutationSettings<duplicateUserRolesParams, typeof duplicateUserRoles>) {
  return useMutation({
    mutationFn: (params: duplicateUserRolesParams) => duplicateUserRoles(params),
    ...settings?.options,
  })
}
