import type { removeCategoryParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeCategory } from '@/api/requests'

export function useRemoveCategories(settings?: MutationSettings<removeCategoryParams, typeof removeCategory>) {
  return useMutation({
    mutationFn: (params: removeCategoryParams) => removeCategory(params),
    ...settings?.options,
  })
}
