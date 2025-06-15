import type { createUsersParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createUser } from '@/api/requests'

export function useCreateUser(settings?: MutationSettings<createUsersParams, typeof createUser>) {
  return useMutation({
    mutationFn: (params: createUsersParams) => createUser(params),
    ...settings?.options,
  })
}
