import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getDeliveryStatuses } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useDeliveryStatusOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadDeliveryStatusOptions({ query, selectedValue }: LoadOptionsParams): Promise<DeliveryStatus[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['delivery-statuses', 'get', { full: true }, filters],
      queryFn: () => getDeliveryStatuses({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.deliveryStatuses || []
  }
}
