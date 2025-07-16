import type { editWarehouseTransactionsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionEdit(settings?: MutationSettings<editWarehouseTransactionsParams, typeof editWarehouseTransaction>) {
  return useMutation({
    mutationFn: editWarehouseTransaction,
    ...settings?.options,
  })
}
