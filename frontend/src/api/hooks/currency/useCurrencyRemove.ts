import type { removeCurrencyParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeCurrency } from '@/api/requests'

export function useCurrencyRemove(settings?: MutationSettings<removeCurrencyParams, typeof removeCurrency>) {
  return useMutation({
    mutationFn: removeCurrency,
    ...settings?.options,
  })
}
