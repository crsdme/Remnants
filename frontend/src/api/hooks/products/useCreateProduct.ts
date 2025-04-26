import type { createProductParams } from '@/api/requests'

import { createProduct } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useCreateProduct(settings?: MutationSettings<createProductParams, typeof createProduct>) {
  return useMutation({
    mutationFn: (params: createProductParams) => createProduct(params),
    ...settings?.options,
  })
}
