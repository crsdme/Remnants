import type { batchCategoryParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { batchCategory } from '@/api/requests'

export function useCategoryBatch(settings?: MutationSettings<batchCategoryParams, typeof batchCategory>) {
  return useMutation({
    mutationFn: batchCategory,
    ...settings?.options,
  })
}
