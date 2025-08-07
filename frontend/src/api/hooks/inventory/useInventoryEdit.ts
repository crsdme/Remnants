import type { editInventoriesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editInventory } from '@/api/requests'

export function useInventoryEdit(settings?: MutationSettings<editInventoriesParams, typeof editInventory>) {
  return useMutation({
    mutationFn: editInventory,
    ...settings?.options,
  })
}
