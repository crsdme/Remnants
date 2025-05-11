import type { duplicateUserParams } from '@/api/requests'

import { duplicateUser } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useDuplicateUsers(settings?: MutationSettings<duplicateUserParams, typeof duplicateUser>) {
  return useMutation({
    mutationFn: (params: duplicateUserParams) => duplicateUser(params),
    ...settings?.options,
  })
}
