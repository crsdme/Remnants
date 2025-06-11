import type { createProductsParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createProduct } from '@/api/requests'

export function useCreateProduct(settings?: MutationSettings<createProductsParams, typeof createProduct>) {
  return useMutation({
    mutationFn: (params: createProductsParams) => createProduct(params),
    ...settings?.options,
  })
}
