import type { GetCurrentBalanceRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getCurrentBalance } from '@/api/requests/balance'

export function useCurrentBalanceQuery(
  params: GetCurrentBalanceRequest = {},
  settings?: QuerySettings<typeof getCurrentBalance>,
) {
  const query = useQuery({
    queryKey: ['balance', 'get-current', params],
    queryFn: async () => getCurrentBalance(params),
    staleTime: 60000,
    ...settings?.options,
  })

  return {
    ...query,
    currentBalance: query.data?.data?.data,
  }
}
