import type { getSuppliersParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getSuppliers } from '@/api/requests'

export function useSupplierQuery(params: getSuppliersParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['suppliers', 'get', params],
    queryFn: () => getSuppliers(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
