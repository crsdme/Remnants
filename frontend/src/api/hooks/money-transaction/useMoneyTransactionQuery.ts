import type { getMoneyTransactionsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getMoneyTransactions } from '@/api/requests'

export function useMoneyTransactionQuery(params: getMoneyTransactionsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['money-transactions', 'get', params],
    queryFn: () => getMoneyTransactions(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
