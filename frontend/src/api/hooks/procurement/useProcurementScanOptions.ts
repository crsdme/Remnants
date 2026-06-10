import { useQueryClient } from '@tanstack/react-query'
import { scanBarcode } from '@/api/requests'

interface LoadOptionsParams {
  barcode: string
  procurementId?: string
}

export function useProcurementScanOptions() {
  const queryClient = useQueryClient()

  return async function loadProcurementScanOptions({ barcode, procurementId }: LoadOptionsParams) {
    const data = await queryClient.fetchQuery({
      queryKey: ['procurements', 'scan', 'item', barcode, procurementId],
      queryFn: async () => scanBarcode({ barcode, procurementId }),
    })

    return data?.data
  }
}
