import type { removeProductParams } from '@/api/requests'

import { removeProduct } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useRemoveProduct(settings?: MutationSettings<removeProductParams, typeof removeProduct>) {
  return useMutation({
    mutationFn: (params: removeProductParams) => removeProduct(params),
    ...settings?.options,
  })
}
