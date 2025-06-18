import type { createUserRolesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createUserRole } from '@/api/requests'

export function useUserRoleCreate(settings?: MutationSettings<createUserRolesParams, typeof createUserRole>) {
  return useMutation({
    mutationFn: createUserRole,
    ...settings?.options,
  })
}
