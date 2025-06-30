import type { getCashregisterAccountsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getCashregisterAccounts } from '@/api/requests'

export function useCashregisterAccountQuery(params: getCashregisterAccountsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['cashregister-accounts', 'get', params],
    queryFn: () => getCashregisterAccounts(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
