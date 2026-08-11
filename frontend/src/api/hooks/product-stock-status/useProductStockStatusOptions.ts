import type { GetProductStockStatusesRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getProductStockStatuses } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProductStockStatusOptions({ defaultFilters }: { defaultFilters?: GetProductStockStatusesRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}) => {
      const params: GetProductStockStatusesRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const response = await queryClient.fetchQuery({
        queryKey: ['product-stock-statuses', 'get', params],
        queryFn: async () => getProductStockStatuses(params),
        staleTime: 60000,
      })

      return response?.data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient, defaultFilters],
  )
}
