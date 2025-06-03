import type { importCurrenciesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { importCurrencies } from '@/api/requests'

export function useImportCurrencies(settings?: MutationSettings<importCurrenciesParams, typeof importCurrencies>) {
  return useMutation({
    mutationFn: (params: importCurrenciesParams) => importCurrencies(params),
    ...settings?.options,
  })
}
