import type { GetMoneyTransactionsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getMoneyTransactions } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useMoneyTransactionQuery(params: GetMoneyTransactionsRequest, settings?: QuerySettings<typeof getMoneyTransactions>) {
  const query = useQuery({
    queryKey: ['money-transactions', 'get', params],
    queryFn: async () => getMoneyTransactions(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const moneyTransactions = listData?.items ?? EMPTY_ITEMS
  const moneyTransactionsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    moneyTransactions,
    moneyTransactionsCount,
  }
}
