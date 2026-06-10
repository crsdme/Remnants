import type { ReceiveWarehouseTransactionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { receiveWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionReceive(settings?: MutationSettings<ReceiveWarehouseTransactionRequest>) {
  return useMutation({
    mutationFn: receiveWarehouseTransaction,
    ...settings?.options,
  })
}
