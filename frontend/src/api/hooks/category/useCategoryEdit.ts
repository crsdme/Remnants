import type { EditCategoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editCategory } from '@/api/requests'

export function useCategoryEdit(settings?: MutationSettings<EditCategoryRequest>) {
  return useMutation({
    mutationFn: editCategory,
    ...settings?.options,
  })
}
