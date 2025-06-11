import type { importProductsParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { importProducts } from '@/api/requests'

export function useImportProduct(settings?: MutationSettings<importProductsParams, typeof importProducts>) {
  return useMutation({
    mutationFn: (params: importProductsParams) => importProducts(params),
    ...settings?.options,
  })
}
