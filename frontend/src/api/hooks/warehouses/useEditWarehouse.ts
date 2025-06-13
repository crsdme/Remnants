import type { editWarehouseParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editWarehouse } from '@/api/requests'

export function useEditWarehouse(settings?: MutationSettings<editWarehouseParams, typeof editWarehouse>) {
  return useMutation({
    mutationFn: (params: editWarehouseParams) => editWarehouse(params),
    ...settings?.options,
  })
}
