import type { ExportProductsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { exportProducts } from '@/api/requests'

export function useProductExport(settings?: MutationSettings<ExportProductsRequest>) {
  return useMutation({
    mutationFn: exportProducts,
    ...settings?.options,
  })
}
