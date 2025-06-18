import type { importCategoriesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { importCategories } from '@/api/requests'

export function useCategoryImport(settings?: MutationSettings<importCategoriesParams, typeof importCategories>) {
  return useMutation({
    mutationFn: importCategories,
    ...settings?.options,
  })
}
