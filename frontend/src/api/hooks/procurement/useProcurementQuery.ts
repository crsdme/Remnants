import type { GetProcurementsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getProcurements } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProcurementQuery(params: GetProcurementsRequest, settings?: QuerySettings<typeof getProcurements>) {
  const query = useQuery({
    queryKey: ['procurements', 'get', params],
    queryFn: async () => getProcurements(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const procurements = listData?.items ?? EMPTY_ITEMS
  const procurementsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    procurements,
    procurementsCount,
  }
}
