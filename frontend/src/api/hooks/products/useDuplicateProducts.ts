import type { duplicateProductParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { duplicateProduct } from '@/api/requests'

export function useDuplicateProduct(settings?: MutationSettings<duplicateProductParams, typeof duplicateProduct>) {
  return useMutation({
    mutationFn: (params: duplicateProductParams) => duplicateProduct(params),
    ...settings?.options,
  })
}
