import type { RemoveWarehouseTransactionsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionRemove(settings?: MutationSettings<RemoveWarehouseTransactionsRequest>) {
  return useMutation({
    mutationFn: removeWarehouseTransaction,
    ...settings?.options,
  })
}
