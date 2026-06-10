import type { InventoryItemDTO } from '@remnant/shared'

import { useQueryClient } from '@tanstack/react-query'
import { getInventoryItems } from '@/api/requests'

interface LoadOptionsParams {
  selectedValue?: string[]
}

export function useInventoryItemsOptions({ mapFn }: { mapFn?: (inventoryItem: InventoryItemDTO) => { value: string, label: string } } = {}) {
  const queryClient = useQueryClient()

  return async function loadInventoryItemsOptions({ selectedValue }: LoadOptionsParams): Promise<InventoryItemDTO[]> {
    const filters = selectedValue ? { inventoryId: selectedValue?.[0] } : {}

    const data = await queryClient.fetchQuery({
      queryKey: ['inventories', 'get', 'items', filters],
      queryFn: async () => getInventoryItems({ filters }),
      staleTime: 60000,
    })

    const inventoryItems = data?.data?.data?.items || []

    return mapFn ? inventoryItems.map(mapFn) as unknown as InventoryItemDTO[] : inventoryItems
  }
}
