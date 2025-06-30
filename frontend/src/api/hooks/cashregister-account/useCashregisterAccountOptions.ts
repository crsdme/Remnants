import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCashregisterAccounts } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useCashregisterAccountOptions({ defaultFilters }: { defaultFilters?: { ids?: string[] } } = {}) {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadCashregisterAccountOptions({ query, selectedValue }: LoadOptionsParams): Promise<CashregisterAccount[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      ...defaultFilters,
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['cashregister-accounts', 'get', { full: true }, filters],
      queryFn: () => getCashregisterAccounts({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.cashregisterAccounts || []
  }
}
