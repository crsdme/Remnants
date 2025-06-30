import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCashregisters } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useCashregisterOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadCashregisterOptions({ query, selectedValue }: LoadOptionsParams): Promise<Cashregister[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['cashregisters', 'get', { full: true }, filters],
      queryFn: () => getCashregisters({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.cashregisters || []
  }
}
