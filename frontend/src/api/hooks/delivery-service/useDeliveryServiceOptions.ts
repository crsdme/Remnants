import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getDeliveryServices } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useDeliveryServiceOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadDeliveryServiceOptions({ query, selectedValue }: LoadOptionsParams): Promise<DeliveryService[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['delivery-services', 'get', { full: true }, filters],
      queryFn: () => getDeliveryServices({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.deliveryServices || []
  }
}
