import type { EditProductPropertyRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editProductProperty } from '@/api/requests'

export function useProductPropertyEdit(settings?: MutationSettings<EditProductPropertyRequest>) {
  return useMutation({
    mutationFn: editProductProperty,
    ...settings?.options,
  })
}
