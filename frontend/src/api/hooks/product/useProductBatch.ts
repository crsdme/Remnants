import type { batchProductParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { batchProduct } from '@/api/requests'

export function useProductBatch(settings?: MutationSettings<batchProductParams, typeof batchProduct>) {
  return useMutation({
    mutationFn: batchProduct,
    ...settings?.options,
  })
}
