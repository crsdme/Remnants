import type { createCashregistersParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createCashregister } from '@/api/requests'

export function useCashregisterCreate(settings?: MutationSettings<createCashregistersParams, typeof createCashregister>) {
  return useMutation({
    mutationFn: createCashregister,
    ...settings?.options,
  })
}
