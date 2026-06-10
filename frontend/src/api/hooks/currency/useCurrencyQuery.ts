import type { GetCurrencyRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getCurrencies } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useCurrencyQuery(params: GetCurrencyRequest, settings?: QuerySettings<typeof getCurrencies>) {
  const query = useQuery({
    queryKey: ['currencies', 'get', params],
    queryFn: async () => getCurrencies(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const currencies = listData?.items ?? EMPTY_ITEMS
  const currenciesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    currencies,
    currenciesCount,
    pagination: listData?.pagination,
  }
}
