import type { postAuthLoginParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { postAuthLogin } from '@/api/requests'

export function useAuthLogin(settings?: MutationSettings<postAuthLoginParams, typeof postAuthLogin>) {
  return useMutation({
    mutationFn: (params: postAuthLoginParams) => postAuthLogin(params),
    ...settings?.options,
  })
}
