import { useQueryClient } from '@tanstack/react-query'
import { getCashregisters } from '@/api/requests'

interface DefaultFilters {
  ids?: string[]
  cashregisterAccounts?: string[]
}

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useCashregisterOptions({ defaultFilters }: { defaultFilters?: DefaultFilters } = {}) {
  const queryClient = useQueryClient()

  return async function loadCashregisterOptions({ query, selectedValue }: LoadOptionsParams): Promise<Cashregister[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      ...defaultFilters,
    }
    const pagination = { full: true }

    const data = await queryClient.fetchQuery({
      queryKey: ['cashregisters', 'get', pagination, filters],
      queryFn: () => getCashregisters({ pagination, filters }),
      staleTime: 60000,
    })

    return data?.data?.cashregisters || []
  }
}
