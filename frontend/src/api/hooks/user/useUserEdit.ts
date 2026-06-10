import type { EditUserRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editUser } from '@/api/requests'

export function useUserEdit(settings?: MutationSettings<EditUserRequest>) {
  return useMutation({
    mutationFn: editUser,
    ...settings?.options,
  })
}
