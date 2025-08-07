import { useQueryClient } from '@tanstack/react-query'
import { getInventoryItems } from '@/api/requests'

interface LoadOptionsParams {
  selectedValue?: string[]
}

export function useInventoryItemsOptions({ mapFn }: { mapFn?: (inventoryItem: InventoryItem) => { value: string, label: string } } = {}) {
  const queryClient = useQueryClient()

  return async function loadInventoryItemsOptions({ selectedValue }: LoadOptionsParams): Promise<InventoryItem[]> {
    const filters = selectedValue ? { inventoryId: selectedValue?.[0] } : {}

    const data = await queryClient.fetchQuery({
      queryKey: ['inventories', 'get', 'items', filters],
      queryFn: () => getInventoryItems({ filters }),
      staleTime: 60000,
    })

    const inventoryItems = data?.data?.inventoryItems || []

    return mapFn ? inventoryItems.map(mapFn) as unknown as InventoryItem[] : inventoryItems
  }
}
