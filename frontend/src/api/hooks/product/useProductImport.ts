import type { ImportProductsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { importProducts } from '@/api/requests'

export function useProductImport(settings?: MutationSettings<ImportProductsRequest>) {
  return useMutation({
    mutationFn: importProducts,
    ...settings?.options,
  })
}
