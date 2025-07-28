import type { getExchangeRatesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getExchangeRates } from '@/api/requests'

export function useCurrencyExcangeRateQuery(params: getExchangeRatesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['currencies', 'get', 'exchange-rate', params],
    queryFn: () => getExchangeRates(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
