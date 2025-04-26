import type { createCurrenciesParams } from '@/api/requests'

import { createCurrency } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useCreateCurrency(settings?: MutationSettings<createCurrenciesParams, typeof createCurrency>) {
  return useMutation({
    mutationFn: (params: createCurrenciesParams) => createCurrency(params),
    ...settings?.options,
  })
}
