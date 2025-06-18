import type { exportCategoriesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { exportCategories } from '@/api/requests'

export function useCategoryExport(settings?: MutationSettings<exportCategoriesParams, typeof exportCategories>) {
  return useMutation({
    mutationFn: exportCategories,
    ...settings?.options,
  })
}
