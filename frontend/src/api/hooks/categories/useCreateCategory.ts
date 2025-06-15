import type { createCategoriesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createCategory } from '@/api/requests'

export function useCreateCategory(settings?: MutationSettings<createCategoriesParams, typeof createCategory>) {
  return useMutation({
    mutationFn: (params: createCategoriesParams) => createCategory(params),
    ...settings?.options,
  })
}
