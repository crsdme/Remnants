import type { getUnitsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getUnits } from '@/api/requests'

export function useUnitQuery(params: getUnitsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['units', 'get', params],
    queryFn: () => getUnits(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
