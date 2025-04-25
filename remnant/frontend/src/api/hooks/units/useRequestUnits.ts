import type { getUnitsParams } from '@/api/requests'

import { getUnits } from '@/api/requests'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useRequestUnits(params: getUnitsParams) {
  return useSuspenseQuery({
    queryKey: ['units', 'get', params.pagination.current],
    queryFn: () => getUnits(params),
    staleTime: 60000,
  })
}
