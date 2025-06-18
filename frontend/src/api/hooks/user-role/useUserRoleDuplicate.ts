import type { duplicateUserRolesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { duplicateUserRoles } from '@/api/requests'

export function useUserRoleDuplicate(settings?: MutationSettings<duplicateUserRolesParams, typeof duplicateUserRoles>) {
  return useMutation({
    mutationFn: duplicateUserRoles,
    ...settings?.options,
  })
}
