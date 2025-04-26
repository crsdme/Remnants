import type { getCurrenciesParams } from '@/api/requests'

import { getCurrencies } from '@/api/requests'
import { useQuery } from '@tanstack/react-query'

export function useRequestCurrencies(params: getCurrenciesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'currencies',
      'get',
      JSON.stringify(params.pagination),
      JSON.stringify(params.filters),
      JSON.stringify(params.sorters),
    ],
    queryFn: () => getCurrencies(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
