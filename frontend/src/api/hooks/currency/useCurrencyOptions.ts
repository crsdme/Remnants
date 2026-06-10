import type { CurrencyDTO, GetCurrencyRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCurrencies } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useCurrencyOptions({ defaultFilters }: { defaultFilters?: GetCurrencyRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<CurrencyDTO[]> => {
      const params: GetCurrencyRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
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
    [queryClient],
  )
}
// import type { getCurrenciesParams } from '@/api/types'
// import { useQueryClient } from '@tanstack/react-query'
// import { useTranslation } from 'react-i18next'
// import { getCurrencies } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// interface UseCurrencyOptionsParams {
//   defaultFilters?: { ids?: string[], cashregisterAccount?: string[] }
//   mapFn?: (currency: Currency) => { value: string, label: string }
// }

// export function useCurrencyOptions({ defaultFilters, mapFn }: UseCurrencyOptionsParams = {}) {
//   const { i18n } = useTranslation()
//   const queryClient = useQueryClient()

//   return async function loadCurrencyOptions({ query, selectedValue }: LoadOptionsParams): Promise<Currency[]> {
//     const params: getCurrenciesParams = {}
//     let filters = { language: i18n.language }

//     if (query) {
//       filters = {
//         ...filters,
//         ...(selectedValue ? { ids: selectedValue } : { names: query }),
//       }
//     }

//     if (defaultFilters) {
//       filters = {
//         ...filters,
//         ...defaultFilters,
//       }
//     }

//     if (Object.keys(filters).length > 0) {
//       params.filters = filters
//     }

//     const data = await queryClient.fetchQuery({
//       queryKey: ['currencies', 'get', params],
//       queryFn: () => getCurrencies(params),
//       staleTime: 60000,
//     })

//     const currencies = data?.data?.currencies || []

//     return mapFn ? currencies.map(mapFn) as unknown as Currency[] : currencies
//   }
// }
