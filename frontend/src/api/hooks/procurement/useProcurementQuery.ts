import type { getProcurementsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getProcurements } from '@/api/requests'

export function useProcurementQuery(params: getProcurementsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['procurements', 'get', params],
    queryFn: () => getProcurements(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
