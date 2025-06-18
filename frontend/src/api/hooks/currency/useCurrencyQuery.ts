import type { getCurrenciesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getCurrencies } from '@/api/requests'

export function useCurrencyQuery(params: getCurrenciesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['currencies', 'get', params],
    queryFn: () => getCurrencies(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
