import type { ConfirmInventoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { confirmInventory } from '@/api/requests'

export function useInventoryConfirm(settings?: MutationSettings<ConfirmInventoryRequest>) {
  return useMutation({
    mutationFn: confirmInventory,
    ...settings?.options,
  })
}
