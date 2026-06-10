import type { GetBalanceRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getBalances } from '@/api/requests/balance'

const EMPTY_ITEMS: never[] = []

export function useBalanceQuery(params: GetBalanceRequest, settings?: QuerySettings) {
  const query = useQuery({
    queryKey: ['balance', 'get', params],
    queryFn: async () => getBalances(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const balances = listData?.items ?? EMPTY_ITEMS
  const balancesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    balances,
    balancesCount,
  }
}
