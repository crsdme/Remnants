import type { importCategoriesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { importCategories } from '@/api/requests'

export function useImportCategories(settings?: MutationSettings<importCategoriesParams, typeof importCategories>) {
  return useMutation({
    mutationFn: (params: importCategoriesParams) => importCategories(params),
    ...settings?.options,
  })
}
