import type { CreateWarehouseTransactionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createWarehouseTransaction } from '@/api/requests'

export function useWarehouseTransactionCreate(settings?: MutationSettings<CreateWarehouseTransactionRequest>) {
  return useMutation({
    mutationFn: createWarehouseTransaction,
    ...settings?.options,
  })
}
