import type { RemoveProductRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeProduct } from '@/api/requests'

export function useProductRemove(settings?: MutationSettings<RemoveProductRequest>) {
  return useMutation({
    mutationFn: removeProduct,
    ...settings?.options,
  })
}
