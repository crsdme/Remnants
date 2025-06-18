import type { removeProductPropertyOptionParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeProductPropertyOption } from '@/api/requests'

export function useProductPropertyOptionRemove(settings?: MutationSettings<removeProductPropertyOptionParams, typeof removeProductPropertyOption>) {
  return useMutation({
    mutationFn: removeProductPropertyOption,
    ...settings?.options,
  })
}
