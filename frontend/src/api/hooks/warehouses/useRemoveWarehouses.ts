import type { removeWarehouseParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeWarehouse } from '@/api/requests'

export function useRemoveWarehouses(settings?: MutationSettings<removeWarehouseParams, typeof removeWarehouse>) {
  return useMutation({
    mutationFn: (params: removeWarehouseParams) => removeWarehouse(params),
    ...settings?.options,
  })
}
