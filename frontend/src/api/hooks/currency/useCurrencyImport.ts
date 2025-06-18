import type { importCurrenciesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { importCurrencies } from '@/api/requests'

export function useCurrencyImport(settings?: MutationSettings<importCurrenciesParams, typeof importCurrencies>) {
  return useMutation({
    mutationFn: importCurrencies,
    ...settings?.options,
  })
}
