import type { GetCashregisterAccountsRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getCashregisterAccounts } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useCashregisterAccountOptions({ defaultFilters }: { defaultFilters?: GetCashregisterAccountsRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}) => {
      const params: GetCashregisterAccountsRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
          active: [true],
        },
      }

      const response = await queryClient.fetchQuery({
        queryKey: ['cashregister-accounts', 'get', params],
        queryFn: async () => getCashregisterAccounts(params),
        staleTime: 60000,
      })

      return response?.data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient, defaultFilters],
  )
}

// import { useQueryClient } from '@tanstack/react-query'
// import { useTranslation } from 'react-i18next'
// import { getCashregisterAccounts } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// interface DefaultFilters {
//   ids?: string[]
//   cashregister?: string[]
// }

// export function useCashregisterAccountOptions({ defaultFilters }: { defaultFilters?: DefaultFilters } = {}) {
//   const queryClient = useQueryClient()
//   const { i18n } = useTranslation()

//   return async function loadCashregisterAccountOptions({ query, selectedValue }: LoadOptionsParams): Promise<CashregisterAccountDTO[]> {
//     const filters = {
//       ...(selectedValue ? { ids: selectedValue } : { names: query }),
//       ...defaultFilters,
//       active: [true],
//       language: i18n.language,
//     }

//     const data = await queryClient.fetchQuery({
//       queryKey: ['cashregister-accounts', 'get', { full: true }, filters],
//       queryFn: () => getCashregisterAccounts({ pagination: { full: true }, filters }),
//       staleTime: 60000,
//     })

//     return data?.data?.items || []
//   }
// }
