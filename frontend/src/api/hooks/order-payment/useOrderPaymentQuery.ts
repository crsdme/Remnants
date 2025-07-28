import type { getOrderPaymentsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getOrderPayments } from '@/api/requests'

export function useOrderPaymentQuery(params: getOrderPaymentsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['order-payments', 'get', params],
    queryFn: () => getOrderPayments(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
