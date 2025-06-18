import type { exportProductsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { exportProducts } from '@/api/requests'

export function useProductExport(settings?: MutationSettings<exportProductsParams, typeof exportProducts>) {
  return useMutation({
    mutationFn: exportProducts,
    ...settings?.options,
  })
}
