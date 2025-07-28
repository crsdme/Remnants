import type { scanBarcodeToDraftResponse } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { scanBarcodeToDraft } from '@/api/requests'

interface LoadOptionsParams {
  barcode: string
  transactionId?: string
}

export function useWarehouseTransactionScanOptions() {
  const queryClient = useQueryClient()

  return async function loadWarehouseTransactionScanOptions({ barcode, transactionId }: LoadOptionsParams): Promise<scanBarcodeToDraftResponse> {
    const data = await queryClient.fetchQuery({
      queryKey: ['warehouse-transactions', 'scan', 'item', barcode, transactionId],
      queryFn: () => scanBarcodeToDraft({ barcode, transactionId }),
    })

    return data?.data
  }
}
