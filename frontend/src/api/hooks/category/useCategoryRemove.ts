import type { removeCategoryParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeCategory } from '@/api/requests'

export function useCategoryRemove(settings?: MutationSettings<removeCategoryParams, typeof removeCategory>) {
  return useMutation({
    mutationFn: removeCategory,
    ...settings?.options,
  })
}
