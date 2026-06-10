import type { GetOrderPaymentsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getOrderPayments } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useOrderPaymentQuery(params: GetOrderPaymentsRequest, settings?: QuerySettings<typeof getOrderPayments>) {
  const query = useQuery({
    queryKey: ['order-payments', 'get', params],
    queryFn: async () => getOrderPayments(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const orderPayments = listData?.items ?? EMPTY_ITEMS
  const orderPaymentsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    orderPayments,
    orderPaymentsCount,
  }
}
