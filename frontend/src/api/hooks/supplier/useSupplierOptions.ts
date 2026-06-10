import type { GetSuppliersRequest, SupplierDTO } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getSuppliers } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useSupplierOptions({ defaultFilters }: { defaultFilters?: GetSuppliersRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<SupplierDTO[]> => {
      const params: GetSuppliersRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['suppliers', 'get', params],
        queryFn: async () => getSuppliers(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}
