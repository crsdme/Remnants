import type { createCurrenciesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createCurrency } from '@/api/requests'

export function useCurrencyCreate(settings?: MutationSettings<createCurrenciesParams, typeof createCurrency>) {
  return useMutation({
    mutationFn: createCurrency,
    ...settings?.options,
  })
}
