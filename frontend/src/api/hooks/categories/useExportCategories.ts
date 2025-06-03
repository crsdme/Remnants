import type { exportCategoriesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { exportCategories } from '@/api/requests'

export function useExportCategories(settings?: MutationSettings<exportCategoriesParams, typeof exportCategories>) {
  return useMutation({
    mutationFn: (params: exportCategoriesParams) => exportCategories(params),
    ...settings?.options,
  })
}
