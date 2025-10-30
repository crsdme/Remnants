import type { createSupplierParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createSupplier } from '@/api/requests'

export function useSupplierCreate(settings?: MutationSettings<createSupplierParams, typeof createSupplier>) {
  return useMutation({
    mutationFn: createSupplier,
    ...settings?.options,
  })
}
