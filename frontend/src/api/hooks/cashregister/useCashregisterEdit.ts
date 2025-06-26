import type { editCashregistersParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editCashregister } from '@/api/requests'

export function useCashregisterEdit(settings?: MutationSettings<editCashregistersParams, typeof editCashregister>) {
  return useMutation({
    mutationFn: editCashregister,
    ...settings?.options,
  })
}
