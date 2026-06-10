import type { CreateProductPropertyOptionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createProductPropertyOption } from '@/api/requests'

export function useProductPropertyOptionCreate(settings?: MutationSettings<CreateProductPropertyOptionRequest>) {
  return useMutation({
    mutationFn: createProductPropertyOption,
    ...settings?.options,
  })
}
