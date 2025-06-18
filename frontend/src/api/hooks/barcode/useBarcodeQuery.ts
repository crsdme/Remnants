import type { getBarcodesParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getBarcodes } from '@/api/requests'

export function useBarcodeQuery(params: getBarcodesParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['barcodes', 'get', params],
    queryFn: () => getBarcodes(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
