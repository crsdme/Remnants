import type { batchProductParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { batchProduct } from '@/api/requests'

export function useBatchProduct(settings?: MutationSettings<batchProductParams, typeof batchProduct>) {
  return useMutation({
    mutationFn: (params: batchProductParams) => batchProduct(params),
    ...settings?.options,
  })
}
