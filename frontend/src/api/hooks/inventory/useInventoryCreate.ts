import type { createInventoriesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createInventory } from '@/api/requests'

export function useInventoryCreate(settings?: MutationSettings<createInventoriesParams, typeof createInventory>) {
  return useMutation({
    mutationFn: createInventory,
    ...settings?.options,
  })
}
