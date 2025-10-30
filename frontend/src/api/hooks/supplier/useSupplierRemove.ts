import type { removeSuppliersParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeSupplier } from '@/api/requests'

export function useSupplierRemove(settings?: MutationSettings<removeSuppliersParams, typeof removeSupplier>) {
  return useMutation({
    mutationFn: removeSupplier,
    ...settings?.options,
  })
}
