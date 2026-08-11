import type { ExportInventoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { exportInventory } from '@/api/requests'

export function useInventoryExport(settings?: MutationSettings<ExportInventoryRequest>) {
  return useMutation({
    mutationFn: exportInventory,
    ...settings?.options,
  })
}
