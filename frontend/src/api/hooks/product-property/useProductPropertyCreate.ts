import type { CreateProductPropertyRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createProductProperty } from '@/api/requests'

export function useProductPropertyCreate(settings?: MutationSettings<CreateProductPropertyRequest>) {
  return useMutation({
    mutationFn: createProductProperty,
    ...settings?.options,
  })
}
