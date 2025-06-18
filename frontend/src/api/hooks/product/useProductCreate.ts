import type { createProductsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createProduct } from '@/api/requests'

export function useProductCreate(settings?: MutationSettings<createProductsParams, typeof createProduct>) {
  return useMutation({
    mutationFn: createProduct,
    ...settings?.options,
  })
}
