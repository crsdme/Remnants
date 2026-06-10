import type { EditInventoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editInventory } from '@/api/requests'

export function useInventoryEdit(settings?: MutationSettings<EditInventoryRequest, typeof editInventory>) {
  return useMutation({
    mutationFn: editInventory,
    ...settings?.options,
  })
}
