import type { CashregisterPopulatedDTO, GetCashregistersRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCashregisters } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

interface UseCashregisterSelectOptionsParams {
  defaultFilters?: GetCashregistersRequest['filters']
}

export function useCashregisterSelectOptions(
  { defaultFilters }: UseCashregisterSelectOptionsParams = {},
) {
  const queryClient = useQueryClient()

  const fetchCashregisters = useCallback(
    async (filters: GetCashregistersRequest['filters'] & { ids?: string[] }): Promise<CashregisterPopulatedDTO[]> => {
      const params: GetCashregistersRequest = {
        pagination: { full: true },
        filters: {
          ...filters,
          ...defaultFilters,
          active: [true],
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['cashregisters', 'get', params],
        queryFn: async () => getCashregisters(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient, defaultFilters],
  )

  const loadSearchOptions = useCallback(
    async (query: string) => fetchCashregisters({ names: query }),
    [fetchCashregisters],
  )

  const loadSelectedOptions = useCallback(
    async (ids: string[]) => fetchCashregisters({ ids } as GetCashregistersRequest['filters'] & { ids?: string[] }),
    [fetchCashregisters],
  )

  return { loadSearchOptions, loadSelectedOptions }
}
