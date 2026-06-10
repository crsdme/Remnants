import type { CreateUserRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createUser } from '@/api/requests'

export function useUserCreate(settings?: MutationSettings<CreateUserRequest>) {
  return useMutation({
    mutationFn: createUser,
    ...settings?.options,
  })
}
