import type { createCategoriesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createCategory } from '@/api/requests'

export function useCategoryCreate(settings?: MutationSettings<createCategoriesParams, typeof createCategory>) {
  return useMutation({
    mutationFn: createCategory,
    ...settings?.options,
  })
}
