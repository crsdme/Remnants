import { useMutation } from '@tanstack/react-query'

import { postAuthLogout } from '@/api/requests'

export function useAuthLogout(settings?: MutationSettings) {
  return useMutation({
    mutationFn: () => postAuthLogout(),
    ...settings?.options,
  })
}
