import type { CreateCategoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createCategory } from '@/api/requests'

export function useCategoryCreate(settings?: MutationSettings<CreateCategoryRequest>) {
  return useMutation({
    mutationFn: createCategory,
    ...settings?.options,
  })
}
