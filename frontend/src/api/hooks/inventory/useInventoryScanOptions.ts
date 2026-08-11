import { useQueryClient } from '@tanstack/react-query'
import { scanInventoryBarcode } from '@/api/requests'

interface LoadOptionsParams {
  filters: {
    barcode: string
    inventoryId: string
    category?: string
  }
  sorters?: {
    createdAt?: 'desc' | 'asc'
  }
}

export function useInventoryScanOptions() {
  const queryClient = useQueryClient()

  return async function loadInventoryScanOptions({ filters, sorters = {} }: LoadOptionsParams) {
    const data = await queryClient.fetchQuery({
      queryKey: ['inventories', 'scan', 'item', filters, sorters],
      queryFn: async () => scanInventoryBarcode({ filters, sorters }),
      staleTime: 0,
      gcTime: 0,
    })

    return data?.data
  }
}
