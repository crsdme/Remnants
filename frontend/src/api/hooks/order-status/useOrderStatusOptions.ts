import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getOrderStatuses } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useOrderStatusOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadOrderStatusOptions({ query, selectedValue }: LoadOptionsParams): Promise<OrderStatus[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['order-statuses', 'get', { full: true }, filters],
      queryFn: () => getOrderStatuses({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.orderStatuses || []
  }
}
