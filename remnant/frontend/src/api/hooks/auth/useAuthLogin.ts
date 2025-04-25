import type { postAuthLoginParams } from '@/api/requests'

import { postAuthLogin } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useAuthLogin(settings?: MutationSettings<postAuthLoginParams, typeof postAuthLogin>) {
  return useMutation({
    mutationFn: (params: postAuthLoginParams) => postAuthLogin(params),
    ...settings?.options,
  })
}
