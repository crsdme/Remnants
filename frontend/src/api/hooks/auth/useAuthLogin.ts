import type { postAuthLoginParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { postAuthLogin } from '@/api/requests'

export function useAuthLogin(settings?: MutationSettings<postAuthLoginParams, typeof postAuthLogin>) {
  return useMutation({
    mutationFn: postAuthLogin,
    ...settings?.options,
  })
}
