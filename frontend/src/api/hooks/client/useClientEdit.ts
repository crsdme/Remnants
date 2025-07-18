import type { editClientParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editClient } from '@/api/requests'

export function useClientEdit(settings?: MutationSettings<editClientParams, typeof editClient>) {
  return useMutation({
    mutationFn: editClient,
    ...settings?.options,
  })
}
