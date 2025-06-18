import type { duplicateUserParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { duplicateUser } from '@/api/requests'

export function useUserDuplicate(settings?: MutationSettings<duplicateUserParams, typeof duplicateUser>) {
  return useMutation({
    mutationFn: duplicateUser,
    ...settings?.options,
  })
}
