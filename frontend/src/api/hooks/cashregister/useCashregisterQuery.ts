import type { getCashregistersParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getCashregisters } from '@/api/requests'

export function useCashregisterQuery(params: getCashregistersParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['cashregisters', 'get', params],
    queryFn: () => getCashregisters(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
