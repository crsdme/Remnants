import type { receiveWarehouseTransactionsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { receiveWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionReceive(settings?: MutationSettings<receiveWarehouseTransactionsParams, typeof receiveWarehouseTransaction>) {
  return useMutation({
    mutationFn: receiveWarehouseTransaction,
    ...settings?.options,
  })
}
