import type { removeUserParams } from '@/api/requests'

import { removeUser } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useRemoveUsers(settings?: MutationSettings<removeUserParams, typeof removeUser>) {
  return useMutation({
    mutationFn: (params: removeUserParams) => removeUser(params),
    ...settings?.options,
  })
}
