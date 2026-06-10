import type { RemoveCategoriesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeCategory } from '@/api/requests'

export function useCategoryRemove(settings?: MutationSettings<RemoveCategoriesRequest>) {
  return useMutation({
    mutationFn: removeCategory,
    ...settings?.options,
  })
}
