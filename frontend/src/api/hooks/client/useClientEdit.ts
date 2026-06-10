import type { EditClientRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editClient } from '@/api/requests'

export function useClientEdit(settings?: MutationSettings<EditClientRequest>) {
  return useMutation({
    mutationFn: editClient,
    ...settings?.options,
  })
}
