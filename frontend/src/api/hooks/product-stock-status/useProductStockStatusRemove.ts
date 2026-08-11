import type { RemoveProductStockStatusesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeProductStockStatus } from '@/api/requests'

export function useProductStockStatusRemove(settings?: MutationSettings<RemoveProductStockStatusesRequest>) {
  return useMutation({
    mutationFn: removeProductStockStatus,
    ...settings?.options,
  })
}
