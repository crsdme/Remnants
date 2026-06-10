import type { RemoveInventoriesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeInventory } from '@/api/requests'

export function useInventoryRemove(settings?: MutationSettings<RemoveInventoriesRequest, typeof removeInventory>) {
  return useMutation({
    mutationFn: removeInventory,
    ...settings?.options,
  })
}
