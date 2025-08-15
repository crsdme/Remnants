import { useQueryClient } from '@tanstack/react-query'
import { getWarehouseTransactionsItems } from '@/api/requests'

interface LoadOptionsParams {
  selectedValue?: string[]
}

export function useWarehouseTransactionItemsOptions({ mapFn }: { mapFn?: (warehouseTransactionItem: WarehouseTransactionItem) => { value: string, label: string } } = {}) {
  const queryClient = useQueryClient()

  return async function loadWarehouseTransactionItemsOptions({ selectedValue }: LoadOptionsParams): Promise<WarehouseTransactionItem[]> {
    const filters = selectedValue ? { transactionId: selectedValue?.[0] } : {}

    const data = await queryClient.fetchQuery({
      queryKey: ['warehouse-transactions', 'get', 'items', filters],
      queryFn: () => getWarehouseTransactionsItems({ filters, pagination: { full: true } }),
      staleTime: 60000,
    })

    const warehouseTransactionsItems = data?.data?.warehouseTransactionsItems || []

    return mapFn ? warehouseTransactionsItems.map(mapFn) as unknown as WarehouseTransactionItem[] : warehouseTransactionsItems
  }
}
