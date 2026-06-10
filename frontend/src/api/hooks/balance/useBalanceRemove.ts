import type { RemoveBalanceRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeBalance } from '@/api/requests/balance'

export function useBalanceRemove(settings?: MutationSettings<RemoveBalanceRequest>) {
  return useMutation({
    mutationFn: removeBalance,
    ...settings?.options,
  })
}
