import type { CreateBalanceRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createBalance } from '@/api/requests/balance'

export function useBalanceCreate(settings?: MutationSettings<CreateBalanceRequest>) {
  return useMutation({
    mutationFn: createBalance,
    ...settings?.options,
  })
}
