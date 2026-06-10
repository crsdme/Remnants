import type { GetCashregistersRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getCashregisters } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useCashregisterQuery(params: GetCashregistersRequest, settings?: QuerySettings<typeof getCashregisters>) {
  const query = useQuery({
    queryKey: ['cashregisters', 'get', params],
    queryFn: async () => getCashregisters(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const cashregisters = listData?.items ?? EMPTY_ITEMS
  const cashregistersCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    cashregisters,
    cashregistersCount,
    pagination: listData?.pagination,
  }
}
