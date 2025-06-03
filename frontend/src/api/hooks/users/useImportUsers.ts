import type { importUsersParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { importUsers } from '@/api/requests'

export function useImportUsers(settings?: MutationSettings<importUsersParams, typeof importUsers>) {
  return useMutation({
    mutationFn: (params: importUsersParams) => importUsers(params),
    ...settings?.options,
  })
}
