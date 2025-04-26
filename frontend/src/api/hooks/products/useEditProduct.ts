import type { editProductParams } from '@/api/requests'

import { editProduct } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useEditProduct(settings?: MutationSettings<editProductParams, typeof editProduct>) {
  return useMutation({
    mutationFn: (params: editProductParams) => editProduct(params),
    ...settings?.options,
  })
}
