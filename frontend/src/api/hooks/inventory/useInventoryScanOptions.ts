import { useQueryClient } from '@tanstack/react-query'
import { scanInventoryBarcode } from '@/api/requests'

interface LoadOptionsParams {
  filters: {
    barcode: string
    category: string
    inventoryId?: string
  }
  sorters: {
    createdAt?: 'desc' | 'asc'
  }
}

export function useInventoryScanOptions() {
  const queryClient = useQueryClient()

  return async function loadInventoryScanOptions({ filters, sorters }: LoadOptionsParams) {
    const data = await queryClient.fetchQuery({
      queryKey: ['inventories', 'scan', 'item', filters, sorters],
      queryFn: async () => scanInventoryBarcode({ filters, sorters }),
    })

    return data?.data
  }
}
