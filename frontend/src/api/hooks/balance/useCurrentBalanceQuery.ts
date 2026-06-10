import type { GetCurrentBalanceResponse } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getCurrentBalance } from '@/api/requests/balance'

export function useCurrentBalanceQuery(params: GetCurrentBalanceResponse, settings?: QuerySettings<typeof getCurrentBalance>) {
  return useQuery({
    queryKey: ['balance', 'get-current', params],
    queryFn: async () => getCurrentBalance(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
