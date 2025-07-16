import type { createWarehouseTransactionsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionCreate(settings?: MutationSettings<createWarehouseTransactionsParams, typeof createWarehouseTransaction>) {
  return useMutation({
    mutationFn: createWarehouseTransaction,
    ...settings?.options,
  })
}
