import type { createUsersParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createUser } from '@/api/requests'

export function useUserCreate(settings?: MutationSettings<createUsersParams, typeof createUser>) {
  return useMutation({
    mutationFn: createUser,
    ...settings?.options,
  })
}
