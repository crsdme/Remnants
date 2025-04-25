import type { batchCurrencyParams } from '@/api/requests'

import { batchCurrency } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useBatchCurrency(settings?: MutationSettings<batchCurrencyParams, typeof batchCurrency>) {
  return useMutation({
    mutationFn: (params: batchCurrencyParams) => batchCurrency(params),
    ...settings?.options,
  })
}
