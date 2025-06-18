import type { editCategoryParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editCategory } from '@/api/requests'

export function useCategoryEdit(settings?: MutationSettings<editCategoryParams, typeof editCategory>) {
  return useMutation({
    mutationFn: editCategory,
    ...settings?.options,
  })
}
