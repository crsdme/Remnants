import type { EditCashregisterAccountRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editCashregisterAccount } from '@/api/requests'

export function useCashregisterAccountEdit(settings?: MutationSettings<EditCashregisterAccountRequest>) {
  return useMutation({
    mutationFn: editCashregisterAccount,
    ...settings?.options,
  })
}
