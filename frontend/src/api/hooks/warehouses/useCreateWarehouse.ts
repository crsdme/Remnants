import type { createWarehousesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createWarehouse } from '@/api/requests'

export function useCreateWarehouse(settings?: MutationSettings<createWarehousesParams, typeof createWarehouse>) {
  return useMutation({
    mutationFn: (params: createWarehousesParams) => createWarehouse(params),
    ...settings?.options,
  })
}
