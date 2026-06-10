import type { CreateUserRoleRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createUserRole } from '@/api/requests'

export function useUserRoleCreate(settings?: MutationSettings<CreateUserRoleRequest>) {
  return useMutation({
    mutationFn: createUserRole,
    ...settings?.options,
  })
}
