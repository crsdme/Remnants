import type { EditUserRoleRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editUserRole } from '@/api/requests'

export function useUserRoleEdit(settings?: MutationSettings<EditUserRoleRequest>) {
  return useMutation({
    mutationFn: editUserRole,
    ...settings?.options,
  })
}
