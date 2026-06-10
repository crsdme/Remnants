import type { RemoveCashregisterAccountsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeCashregisterAccount } from '@/api/requests'

export function useCashregisterAccountRemove(settings?: MutationSettings<RemoveCashregisterAccountsRequest>) {
  return useMutation({
    mutationFn: removeCashregisterAccount,
    ...settings?.options,
  })
}
