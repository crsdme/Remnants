import type { removeCashregisterAccountsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeCashregisterAccount } from '@/api/requests'

export function useCashregisterAccountRemove(settings?: MutationSettings<removeCashregisterAccountsParams, typeof removeCashregisterAccount>) {
  return useMutation({
    mutationFn: removeCashregisterAccount,
    ...settings?.options,
  })
}
