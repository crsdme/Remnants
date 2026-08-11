import type { UpsertInventoryItemRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { upsertInventoryItem } from '@/api/requests'

export function useInventoryUpsertItem(settings?: MutationSettings<UpsertInventoryItemRequest>) {
  return useMutation({
    mutationFn: upsertInventoryItem,
    ...settings?.options,
  })
}
