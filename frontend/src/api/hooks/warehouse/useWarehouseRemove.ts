import type { RemoveWarehousesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeWarehouse } from '@/api/requests'

export function useWarehouseRemove(settings?: MutationSettings<RemoveWarehousesRequest>) {
  return useMutation({
    mutationFn: removeWarehouse,
    ...settings?.options,
  })
}
