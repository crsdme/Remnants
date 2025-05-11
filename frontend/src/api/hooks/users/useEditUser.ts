import type { editUserParams } from '@/api/requests'

import { editUser } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useEditUser(settings?: MutationSettings<editUserParams, typeof editUser>) {
  return useMutation({
    mutationFn: (params: editUserParams) => editUser(params),
    ...settings?.options,
  })
}
