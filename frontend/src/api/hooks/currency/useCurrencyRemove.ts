import type { RemoveCurrencyRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeCurrency } from '@/api/requests'

export function useCurrencyRemove(settings?: MutationSettings<RemoveCurrencyRequest>) {
  return useMutation({
    mutationFn: removeCurrency,
    ...settings?.options,
  })
}
