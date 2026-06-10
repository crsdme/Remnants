import type { LoginRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { postAuthLogin } from '@/api/requests'

export function useAuthLogin(settings?: MutationSettings<LoginRequest, typeof postAuthLogin>) {
  return useMutation({
    mutationFn: postAuthLogin,
    ...settings?.options,
  })
}
