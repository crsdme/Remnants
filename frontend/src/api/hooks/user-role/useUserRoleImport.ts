import type { importUserRolesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { importUserRoles } from '@/api/requests'

export function useUserRoleImport(settings?: MutationSettings<importUserRolesParams, typeof importUserRoles>) {
  return useMutation({
    mutationFn: importUserRoles,
    ...settings?.options,
  })
}
