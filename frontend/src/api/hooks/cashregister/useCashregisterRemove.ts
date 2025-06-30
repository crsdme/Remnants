import type { removeCashregistersParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeCashregister } from '@/api/requests'

export function useCashregisterRemove(settings?: MutationSettings<removeCashregistersParams, typeof removeCashregister>) {
  return useMutation({
    mutationFn: removeCashregister,
    ...settings?.options,
  })
}
