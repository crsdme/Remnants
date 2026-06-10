import type { CreateCashregisterRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createCashregister } from '@/api/requests'

export function useCashregisterCreate(settings?: MutationSettings<CreateCashregisterRequest>) {
  return useMutation({
    mutationFn: createCashregister,
    ...settings?.options,
  })
}
