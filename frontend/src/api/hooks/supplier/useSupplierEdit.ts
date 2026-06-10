import type { EditSupplierRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editSupplier } from '@/api/requests'

export function useSupplierEdit(settings?: MutationSettings<EditSupplierRequest>) {
  return useMutation({
    mutationFn: editSupplier,
    ...settings?.options,
  })
}
