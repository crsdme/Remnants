import type { CashregisterAccountPopulatedDTO, GetCashregisterAccountsRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCashregisterAccounts } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

interface UseCashregisterAccountSelectOptionsParams {
  defaultFilters?: GetCashregisterAccountsRequest['filters']
}

export function useCashregisterAccountSelectOptions(
  { defaultFilters }: UseCashregisterAccountSelectOptionsParams = {},
) {
  const queryClient = useQueryClient()

  const fetchCashregisterAccounts = useCallback(
    async (filters: GetCashregisterAccountsRequest['filters']): Promise<CashregisterAccountPopulatedDTO[]> => {
      const params: GetCashregisterAccountsRequest = {
        pagination: { full: true },
        filters: {
          ...filters,
          ...defaultFilters,
          active: [true],
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['cashregister-accounts', 'get', params],
        queryFn: async () => getCashregisterAccounts(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient, defaultFilters],
  )

  const loadSearchOptions = useCallback(
    async (query: string) => fetchCashregisterAccounts({ names: query }),
    [fetchCashregisterAccounts],
  )

  const loadSelectedOptions = useCallback(
    async (ids: string[]) => fetchCashregisterAccounts({ ids }),
    [fetchCashregisterAccounts],
  )

  return { loadSearchOptions, loadSelectedOptions }
}
