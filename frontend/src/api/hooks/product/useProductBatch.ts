import type { BatchProductRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { batchProduct } from '@/api/requests'

export function useProductBatch(settings?: MutationSettings<BatchProductRequest>) {
  return useMutation({
    mutationFn: batchProduct,
    ...settings?.options,
  })
}
