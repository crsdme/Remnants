import type { GetPaymentApplicationsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getPaymentApplications } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function usePaymentApplicationQuery(
  params: GetPaymentApplicationsRequest,
  settings?: QuerySettings<typeof getPaymentApplications>,
) {
  const query = useQuery({
    queryKey: ['payment-applications', 'get', params],
    queryFn: async () => getPaymentApplications(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const paymentApplications = listData?.items ?? EMPTY_ITEMS
  const paymentApplicationsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    paymentApplications,
    paymentApplicationsCount,
  }
}
