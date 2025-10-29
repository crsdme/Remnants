import type { getBalancesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getBalances } from '@/api/requests/balance'

export function useBalanceQuery(params: getBalancesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['balance', 'get', params],
    queryFn: () => getBalances(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
