import type { getBarcodesParams } from '@/api/requests'

import { useQuery } from '@tanstack/react-query'
import { getBarcodes } from '@/api/requests'

export function useRequestBarcodes(params: getBarcodesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: [
      'barcodes',
      'get',
      params.pagination,
      params.filters,
      params.sorters,
    ],
    queryFn: () => getBarcodes(params),
    ...(settings?.options ?? {}),
    staleTime: 60000,
  })
}
