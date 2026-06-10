import type { RemoveCashregistersRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeCashregister } from '@/api/requests'

export function useCashregisterRemove(settings?: MutationSettings<RemoveCashregistersRequest>) {
  return useMutation({
    mutationFn: removeCashregister,
    ...settings?.options,
  })
}
