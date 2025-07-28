import type { removeWarehouseTransactionsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionRemove(settings?: MutationSettings<removeWarehouseTransactionsParams, typeof removeWarehouseTransaction>) {
  return useMutation({
    mutationFn: removeWarehouseTransaction,
    ...settings?.options,
  })
}
