export function useWarehouseTransactionItemsOptions(value: any) {
  return value
  // const queryClient = useQueryClient()

  // return async function loadWarehouseTransactionItemsOptions({ selectedValue }: LoadOptionsParams): Promise<GetWarehouseTransactionsItemsResponse[]> {
  //   const filters = selectedValue ? { transactionId: selectedValue?.[0] } : {}

  //   const data = await queryClient.fetchQuery({
  //     queryKey: ['warehouse-transactions', 'get', 'items', filters],
  //     queryFn: () => getWarehouseTransactionsItems({ filters, pagination: { full: true } }),
  //     staleTime: 60000,
  //   })

  //   const warehouseTransactionsItems = data?.data?.warehouseTransactionsItems || []

  //   return mapFn ? warehouseTransactionsItems.map(mapFn) as unknown as WarehouseTransactionItem[] : warehouseTransactionsItems
  // }
}
