import type { EditExchangeRateRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editExchangeRate } from '@/api/requests'

export function useCurrencyExchangeRateEdit(settings?: MutationSettings<EditExchangeRateRequest>) {
  return useMutation({
    mutationFn: editExchangeRate,
    ...settings?.options,
  })
}
