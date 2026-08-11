import type { EditProductStockStatusRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editProductStockStatus } from '@/api/requests'

export function useProductStockStatusEdit(settings?: MutationSettings<EditProductStockStatusRequest>) {
  return useMutation({
    mutationFn: editProductStockStatus,
    ...settings?.options,
  })
}
