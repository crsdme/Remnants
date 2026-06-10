import type { GetCashregisterAccountsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getCashregisterAccounts } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useCashregisterAccountQuery(params: GetCashregisterAccountsRequest, settings?: QuerySettings<typeof getCashregisterAccounts>) {
  const query = useQuery({
    queryKey: ['cashregister-accounts', 'get', params],
    queryFn: async () => getCashregisterAccounts(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const cashregisterAccounts = listData?.items ?? EMPTY_ITEMS
  const cashregisterAccountsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    cashregisterAccounts,
    cashregisterAccountsCount,
    pagination: listData?.pagination,
  }
}
