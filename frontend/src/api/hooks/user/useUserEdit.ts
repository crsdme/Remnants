import type { editUserParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editUser } from '@/api/requests'

export function useUserEdit(settings?: MutationSettings<editUserParams, typeof editUser>) {
  return useMutation({
    mutationFn: editUser,
    ...settings?.options,
  })
}
