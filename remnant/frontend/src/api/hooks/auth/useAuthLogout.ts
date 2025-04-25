import { postAuthLogout } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'

export function useAuthLogout(settings?: MutationSettings) {
  return useMutation({
    mutationFn: () => postAuthLogout(),
    ...settings?.options,
  })
}
