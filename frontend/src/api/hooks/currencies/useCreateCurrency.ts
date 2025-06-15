import type { createCurrenciesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createCurrency } from '@/api/requests'

export function useCreateCurrency(settings?: MutationSettings<createCurrenciesParams, typeof createCurrency>) {
  return useMutation({
    mutationFn: (params: createCurrenciesParams) => createCurrency(params),
    ...settings?.options,
  })
}
