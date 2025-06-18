import type { importProductsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { importProducts } from '@/api/requests'

export function useProductImport(settings?: MutationSettings<importProductsParams, typeof importProducts>) {
  return useMutation({
    mutationFn: importProducts,
    ...settings?.options,
  })
}
