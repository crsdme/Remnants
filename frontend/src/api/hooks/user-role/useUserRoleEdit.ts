import type { editUserRoleParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editUserRole } from '@/api/requests'

export function useUserRoleEdit(settings?: MutationSettings<editUserRoleParams, typeof editUserRole>) {
  return useMutation({
    mutationFn: editUserRole,
    ...settings?.options,
  })
}
