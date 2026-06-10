import type { CurrencyDTO, GetCurrencyRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCurrencies } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

interface UseCurrencySelectOptionsParams {
  defaultFilters?: GetCurrencyRequest['filters']
}

export function useCurrencySelectOptions(
  { defaultFilters }: UseCurrencySelectOptionsParams = {},
) {
  const queryClient = useQueryClient()

  const fetchCurrencies = useCallback(
    async (filters: GetCurrencyRequest['filters']): Promise<CurrencyDTO[]> => {
      const params: GetCurrencyRequest = {
        pagination: { full: true },
        filters: {
          ...filters,
          ...defaultFilters,
          active: [true],
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['currencies', 'get', params],
        queryFn: async () => getCurrencies(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient, defaultFilters],
  )

  const loadSearchOptions = useCallback(
    async (query: string) => fetchCurrencies({ names: query }),
    [fetchCurrencies],
  )

  const loadSelectedOptions = useCallback(
    async (ids: string[]) => fetchCurrencies({ ids }),
    [fetchCurrencies],
  )

  return { loadSearchOptions, loadSelectedOptions }
}
