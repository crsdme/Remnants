import type { removeCurrencyParams } from '@/api/requests'

import { removeCurrency } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useRemoveCurrency(settings?: MutationSettings<removeCurrencyParams, typeof removeCurrency>) {
  return useMutation({
    mutationFn: (params: removeCurrencyParams) => removeCurrency(params),
    ...settings?.options,
  })
}
