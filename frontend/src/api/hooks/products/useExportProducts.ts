import type { exportProductsParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { exportProducts } from '@/api/requests'

export function useExportProduct(settings?: MutationSettings<exportProductsParams, typeof exportProducts>) {
  return useMutation({
    mutationFn: (params: exportProductsParams) => exportProducts(params),
    ...settings?.options,
  })
}
