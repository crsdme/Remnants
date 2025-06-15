import type { getCurrenciesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getCurrencies } from '@/api/requests'

export function useRequestCurrencies(params: getCurrenciesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'currencies',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getCurrencies(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
