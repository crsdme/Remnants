import type { createProductParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createProduct } from '@/api/requests'

export function useCreateProduct(settings?: MutationSettings<createProductParams, typeof createProduct>) {
  return useMutation({
    mutationFn: (params: createProductParams) => createProduct(params),
    ...settings?.options,
  })
}
