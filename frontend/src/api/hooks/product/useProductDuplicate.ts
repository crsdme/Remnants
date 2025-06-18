import type { duplicateProductParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { duplicateProduct } from '@/api/requests'

export function useProductDuplicate(settings?: MutationSettings<duplicateProductParams, typeof duplicateProduct>) {
  return useMutation({
    mutationFn: duplicateProduct,
    ...settings?.options,
  })
}
