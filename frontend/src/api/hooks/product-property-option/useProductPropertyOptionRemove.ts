import type { RemoveProductPropertyOptionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeProductPropertyOption } from '@/api/requests'

export function useProductPropertyOptionRemove(settings?: MutationSettings<RemoveProductPropertyOptionRequest>) {
  return useMutation({
    mutationFn: removeProductPropertyOption,
    ...settings?.options,
  })
}
