import type { getCurrentBalanceParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getCurrentBalance } from '@/api/requests/balance'

export function useCurrentBalanceQuery(params: getCurrentBalanceParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['balance', 'get-current', params],
    queryFn: () => getCurrentBalance(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
