import type { removeCurrencyParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeCurrency } from '@/api/requests'

export function useRemoveCurrency(settings?: MutationSettings<removeCurrencyParams, typeof removeCurrency>) {
  return useMutation({
    mutationFn: (params: removeCurrencyParams) => removeCurrency(params),
    ...settings?.options,
  })
}
