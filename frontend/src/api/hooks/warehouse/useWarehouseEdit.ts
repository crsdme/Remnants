import type { editWarehouseParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editWarehouse } from '@/api/requests'

export function useWarehouseEdit(settings?: MutationSettings<editWarehouseParams, typeof editWarehouse>) {
  return useMutation({
    mutationFn: editWarehouse,
    ...settings?.options,
  })
}
