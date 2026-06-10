import type { CreateProductRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createProduct } from '@/api/requests'

export function useProductCreate(settings?: MutationSettings<CreateProductRequest>) {
  return useMutation({
    mutationFn: createProduct,
    ...settings?.options,
  })
}
