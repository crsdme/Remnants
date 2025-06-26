import type { createCashregisterAccountsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createCashregisterAccount } from '@/api/requests'

export function useCashregisterAccountCreate(settings?: MutationSettings<createCashregisterAccountsParams, typeof createCashregisterAccount>) {
  return useMutation({
    mutationFn: createCashregisterAccount,
    ...settings?.options,
  })
}
