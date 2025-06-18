import type { batchCurrencyParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { batchCurrency } from '@/api/requests'

export function useCurrencyBatch(settings?: MutationSettings<batchCurrencyParams, typeof batchCurrency>) {
  return useMutation({
    mutationFn: batchCurrency,
    ...settings?.options,
  })
}
