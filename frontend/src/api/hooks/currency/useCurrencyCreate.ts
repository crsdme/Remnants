import type { CreateCurrencyRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createCurrency } from '@/api/requests'

export function useCurrencyCreate(settings?: MutationSettings<CreateCurrencyRequest>) {
  return useMutation({
    mutationFn: createCurrency,
    ...settings?.options,
  })
}
