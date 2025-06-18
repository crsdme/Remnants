import type { importUsersParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { importUsers } from '@/api/requests'

export function useUserImport(settings?: MutationSettings<importUsersParams, typeof importUsers>) {
  return useMutation({
    mutationFn: importUsers,
    ...settings?.options,
  })
}
