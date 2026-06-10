import type { CreateInventoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createInventory } from '@/api/requests'

export function useInventoryCreate(settings?: MutationSettings<CreateInventoryRequest, typeof createInventory>) {
  return useMutation({
    mutationFn: createInventory,
    ...settings?.options,
  })
}
