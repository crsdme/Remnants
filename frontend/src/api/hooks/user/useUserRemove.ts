import type { removeUserParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeUser } from '@/api/requests'

export function useUserRemove(settings?: MutationSettings<removeUserParams, typeof removeUser>) {
  return useMutation({
    mutationFn: removeUser,
    ...settings?.options,
  })
}
