import type { EditProductRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editProduct } from '@/api/requests'

export function useProductEdit(settings?: MutationSettings<EditProductRequest>) {
  return useMutation({
    mutationFn: editProduct,
    ...settings?.options,
  })
}
