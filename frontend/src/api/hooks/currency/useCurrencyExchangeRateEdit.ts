import type { editExchangeRateParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editExchangeRate } from '@/api/requests'

export function useCurrencyExchangeRateEdit(settings?: MutationSettings<editExchangeRateParams, typeof editExchangeRate>) {
  return useMutation({
    mutationFn: editExchangeRate,
    ...settings?.options,
  })
}
