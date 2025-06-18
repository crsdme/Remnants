import type { createWarehousesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createWarehouse } from '@/api/requests'

export function useWarehouseCreate(settings?: MutationSettings<createWarehousesParams, typeof createWarehouse>) {
  return useMutation({
    mutationFn: createWarehouse,
    ...settings?.options,
  })
}
