import type { GetCashregistersRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCashregisters } from '@/api/requests'

export function useCashregisterOptions({ defaultFilters }: { defaultFilters?: GetCashregistersRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}) => {
      const params: GetCashregistersRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
          active: [true],
        },
      }

      const response = await queryClient.fetchQuery({
        queryKey: ['cashregisters', 'get', params],
        queryFn: async () => getCashregisters(params),
        staleTime: 60000,
      })

      return response.data.data.items ?? []
    },
    [queryClient],
  )
}
