import type { GetExchangeRatesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getExchangeRates } from '@/api/requests'

export function useCurrencyExcangeRateQuery(params: GetExchangeRatesRequest, settings?: QuerySettings<typeof getExchangeRates>) {
  const query = useQuery({
    queryKey: ['currencies', 'get', 'exchange-rate', params],
    queryFn: async () => getExchangeRates(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const items = listData?.items ?? []
  const total = listData?.pagination?.total ?? 0

  return {
    ...query,
    items,
    total,
    pagination: listData?.pagination,
  }
}
