import type { EditWarehouseRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editWarehouse } from '@/api/requests'

export function useWarehouseEdit(settings?: MutationSettings<EditWarehouseRequest>) {
  return useMutation({
    mutationFn: editWarehouse,
    ...settings?.options,
  })
}
