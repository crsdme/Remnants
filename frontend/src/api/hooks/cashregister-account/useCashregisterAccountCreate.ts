import type { CreateCashregisterAccountRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createCashregisterAccount } from '@/api/requests'

export function useCashregisterAccountCreate(settings?: MutationSettings<CreateCashregisterAccountRequest>) {
  return useMutation({
    mutationFn: createCashregisterAccount,
    ...settings?.options,
  })
}
