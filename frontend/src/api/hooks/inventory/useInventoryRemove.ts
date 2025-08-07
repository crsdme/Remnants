import type { removeInventoriesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeInventory } from '@/api/requests'

export function useInventoryRemove(settings?: MutationSettings<removeInventoriesParams, typeof removeInventory>) {
  return useMutation({
    mutationFn: removeInventory,
    ...settings?.options,
  })
}
