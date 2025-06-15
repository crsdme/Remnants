import type { getUnitsParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getUnits } from '@/api/requests'

export function useRequestUnits(params: getUnitsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'units',
      'get',
      JSON.stringify(params.pagination),
      JSON.stringify(params.filters),
      JSON.stringify(params.sorters),
    ],
    queryFn: () => getUnits(params),
    ...settings?.options,
    staleTime: 60000,
  })
}
