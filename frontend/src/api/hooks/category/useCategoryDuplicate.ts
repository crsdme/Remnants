import type { duplicateCategoryParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { duplicateCategory } from '@/api/requests'

export function useCategoryDuplicate(settings?: MutationSettings<duplicateCategoryParams, typeof duplicateCategory>) {
  return useMutation({
    mutationFn: duplicateCategory,
    ...settings?.options,
  })
}
