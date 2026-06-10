import type { GetSuppliersRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getSuppliers } from '@/api/requests'

export function useSupplierQuery(params: GetSuppliersRequest, settings?: QuerySettings<typeof getSuppliers>) {
  const query = useQuery({
    queryKey: ['suppliers', 'get', params],
    queryFn: async () => getSuppliers(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const suppliers = query.data?.data?.data?.items || []
  const suppliersCount = query.data?.data?.data?.pagination?.total || 0

  return {
    ...query,
    suppliers,
    suppliersCount,
  }
}
