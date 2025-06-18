import type { removeProductParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeProduct } from '@/api/requests'

export function useProductRemove(settings?: MutationSettings<removeProductParams, typeof removeProduct>) {
  return useMutation({
    mutationFn: removeProduct,
    ...settings?.options,
  })
}
