import type { editProductParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editProduct } from '@/api/requests'

export function useProductEdit(settings?: MutationSettings<editProductParams, typeof editProduct>) {
  return useMutation({
    mutationFn: editProduct,
    ...settings?.options,
  })
}
