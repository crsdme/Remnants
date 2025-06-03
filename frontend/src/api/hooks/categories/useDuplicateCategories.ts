import type { duplicateCategoryParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { duplicateCategory } from '@/api/requests'

export function useDuplicateCategories(settings?: MutationSettings<duplicateCategoryParams, typeof duplicateCategory>) {
  return useMutation({
    mutationFn: (params: duplicateCategoryParams) => duplicateCategory(params),
    ...settings?.options,
  })
}
