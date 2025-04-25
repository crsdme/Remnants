import type { editCategoryParams } from '@/api/requests'

import { editCategory } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useEditCategory(settings?: MutationSettings<editCategoryParams, typeof editCategory>) {
  return useMutation({
    mutationFn: (params: editCategoryParams) => editCategory(params),
    ...settings?.options,
  })
}
