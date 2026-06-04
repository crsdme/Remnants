import type { editClientParams } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editClient } from '@/api/requests'

export function useClientEdit(settings?: MutationSettings<editClientParams>) {
  return useMutation({
    mutationFn: editClient,
    ...settings?.options,
  })
}
