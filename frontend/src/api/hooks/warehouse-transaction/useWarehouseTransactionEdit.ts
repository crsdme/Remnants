import type { EditWarehouseTransactionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionEdit(settings?: MutationSettings<EditWarehouseTransactionRequest>) {
  return useMutation({
    mutationFn: editWarehouseTransaction,
    ...settings?.options,
  })
}
