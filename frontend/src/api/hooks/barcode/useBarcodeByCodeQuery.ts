import type { GetBarcodeByCodeRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getBarcodeByCode } from '@/api/requests'

export function useBarcodeByCodeQuery(
  params: GetBarcodeByCodeRequest,
  settings?: QuerySettings<typeof getBarcodeByCode>,
) {
  const query = useQuery({
    queryKey: ['barcodes', 'get-by-code', params],
    queryFn: async () => getBarcodeByCode(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const barcode = query.data?.data?.data
  return {
    ...query,
    barcode,
  }
}
