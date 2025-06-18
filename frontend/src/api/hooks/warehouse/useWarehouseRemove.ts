import type { removeWarehouseParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeWarehouse } from '@/api/requests'

export function useWarehouseRemove(settings?: MutationSettings<removeWarehouseParams, typeof removeWarehouse>) {
  return useMutation({
    mutationFn: removeWarehouse,
    ...settings?.options,
  })
}
