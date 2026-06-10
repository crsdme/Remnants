import type { RemoveSuppliersRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeSupplier } from '@/api/requests'

export function useSupplierRemove(settings?: MutationSettings<RemoveSuppliersRequest>) {
  return useMutation({
    mutationFn: removeSupplier,
    ...settings?.options,
  })
}
