import type { EditCashregisterRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editCashregister } from '@/api/requests'

export function useCashregisterEdit(settings?: MutationSettings<EditCashregisterRequest>) {
  return useMutation({
    mutationFn: editCashregister,
    ...settings?.options,
  })
}
