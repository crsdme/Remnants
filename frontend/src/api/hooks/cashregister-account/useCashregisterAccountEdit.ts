import type { editCashregisterAccountsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editCashregisterAccount } from '@/api/requests'

export function useCashregisterAccountEdit(settings?: MutationSettings<editCashregisterAccountsParams, typeof editCashregisterAccount>) {
  return useMutation({
    mutationFn: editCashregisterAccount,
    ...settings?.options,
  })
}
