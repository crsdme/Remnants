import type { importUserRolesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { importUserRoles } from '@/api/requests'

export function useImportUserRoles(settings?: MutationSettings<importUserRolesParams, typeof importUserRoles>) {
  return useMutation({
    mutationFn: (params: importUserRolesParams) => importUserRoles(params),
    ...settings?.options,
  })
}
