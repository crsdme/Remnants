import type { editUserRoleParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editUserRole } from '@/api/requests'

export function useEditUserRole(settings?: MutationSettings<editUserRoleParams, typeof editUserRole>) {
  return useMutation({
    mutationFn: (params: editUserRoleParams) => editUserRole(params),
    ...settings?.options,
  })
}
