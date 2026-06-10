import type { CreateSupplierRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createSupplier } from '@/api/requests'

export function useSupplierCreate(settings?: MutationSettings<CreateSupplierRequest>) {
  return useMutation({
    mutationFn: createSupplier,
    ...settings?.options,
  })
}
