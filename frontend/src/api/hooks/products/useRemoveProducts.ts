import type { removeProductParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeProduct } from '@/api/requests'

export function useRemoveProduct(settings?: MutationSettings<removeProductParams, typeof removeProduct>) {
  return useMutation({
    mutationFn: (params: removeProductParams) => removeProduct(params),
    ...settings?.options,
  })
}
