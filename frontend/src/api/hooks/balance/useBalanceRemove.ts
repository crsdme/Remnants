import type { removeBalancesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeBalance } from '@/api/requests/balance'

export function useBalanceRemove(settings?: MutationSettings<removeBalancesParams, typeof removeBalance>) {
  return useMutation({
    mutationFn: removeBalance,
    ...settings?.options,
  })
}
