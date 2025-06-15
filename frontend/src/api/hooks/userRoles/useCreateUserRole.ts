import type { createUserRolesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createUserRole } from '@/api/requests'

export function useCreateUserRole(settings?: MutationSettings<createUserRolesParams, typeof createUserRole>) {
  return useMutation({
    mutationFn: (params: createUserRolesParams) => createUserRole(params),
    ...settings?.options,
  })
}
