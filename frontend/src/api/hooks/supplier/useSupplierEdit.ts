import type { editSupplierParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editSupplier } from '@/api/requests'

export function useSupplierEdit(settings?: MutationSettings<editSupplierParams, typeof editSupplier>) {
  return useMutation({
    mutationFn: editSupplier,
    ...settings?.options,
  })
}
