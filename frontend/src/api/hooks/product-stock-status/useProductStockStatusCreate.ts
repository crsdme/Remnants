import type { CreateProductStockStatusRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createProductStockStatus } from '@/api/requests'

export function useProductStockStatusCreate(settings?: MutationSettings<CreateProductStockStatusRequest>) {
  return useMutation({
    mutationFn: createProductStockStatus,
    ...settings?.options,
  })
}
