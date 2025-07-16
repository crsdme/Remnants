import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getOrderSources } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useOrderSourceOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadOrderSourceOptions({ query, selectedValue }: LoadOptionsParams): Promise<OrderSource[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['order-sources', 'get', { full: true }, filters],
      queryFn: () => getOrderSources({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.orderSources || []
  }
}
