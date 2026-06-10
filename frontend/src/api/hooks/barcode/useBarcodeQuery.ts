import type { GetBarcodesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getBarcodes } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useBarcodeQuery(
  params: GetBarcodesRequest,
  settings?: QuerySettings<typeof getBarcodes>,
) {
  const query = useQuery({
    queryKey: ['barcodes', 'get', params],
    queryFn: async () => getBarcodes(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const barcodes = listData?.items ?? EMPTY_ITEMS
  const barcodesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    barcodes,
    barcodesCount,
    pagination: listData?.pagination,
  }
}
