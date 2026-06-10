import type { RemoveUserRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeUser } from '@/api/requests'

export function useUserRemove(settings?: MutationSettings<RemoveUserRequest>) {
  return useMutation({
    mutationFn: removeUser,
    ...settings?.options,
  })
}
