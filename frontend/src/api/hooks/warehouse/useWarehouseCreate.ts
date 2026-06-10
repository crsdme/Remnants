import type { CreateWarehouseRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createWarehouse } from '@/api/requests'

export function useWarehouseCreate(settings?: MutationSettings<CreateWarehouseRequest>) {
  return useMutation({
    mutationFn: createWarehouse,
    ...settings?.options,
  })
}
