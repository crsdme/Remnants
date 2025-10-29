import type { createBalanceParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createBalance } from '@/api/requests/balance'

export function useBalanceCreate(settings?: MutationSettings<createBalanceParams, typeof createBalance>) {
  return useMutation({
    mutationFn: createBalance,
    ...settings?.options,
  })
}
