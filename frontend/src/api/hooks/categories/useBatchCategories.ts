import type { batchCategoryParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { batchCategory } from '@/api/requests'

export function useBatchCategory(settings?: MutationSettings<batchCategoryParams, typeof batchCategory>) {
  return useMutation({
    mutationFn: (params: batchCategoryParams) => batchCategory(params),
    ...settings?.options,
  })
}
