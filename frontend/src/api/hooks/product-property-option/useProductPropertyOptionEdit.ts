import type { EditProductPropertyOptionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editProductPropertyOption } from '@/api/requests'

export function useProductPropertyOptionEdit(settings?: MutationSettings<EditProductPropertyOptionRequest>) {
  return useMutation({
    mutationFn: editProductPropertyOption,
    ...settings?.options,
  })
}
