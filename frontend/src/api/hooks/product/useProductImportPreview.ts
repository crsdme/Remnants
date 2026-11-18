import type { PreviewImportProductsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { previewImportProducts } from '@/api/requests'

export function useProductImportPreview(settings?: MutationSettings<PreviewImportProductsRequest>) {
  return useMutation({
    mutationFn: previewImportProducts,
    ...settings?.options,
  })
}
