import type { removeCategoryParams } from '@/api/requests'

import { removeCategory } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useRemoveCategory(settings?: MutationSettings<removeCategoryParams, typeof removeCategory>) {
  return useMutation({
    mutationFn: (params: removeCategoryParams) => removeCategory(params),
    ...settings?.options,
  })
}
