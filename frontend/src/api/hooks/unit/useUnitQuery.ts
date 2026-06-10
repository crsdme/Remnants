import type { GetUnitRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getUnits } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useUnitQuery(params: GetUnitRequest, settings?: QuerySettings<typeof getUnits>) {
  const query = useQuery({
    queryKey: ['units', 'get', params],
    queryFn: async () => getUnits(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const units = listData?.items ?? EMPTY_ITEMS
  const unitsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    units,
    unitsCount,
    pagination: listData?.pagination,
  }
}
