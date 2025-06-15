import type { editCurrencyParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editCurrency } from '@/api/requests'

export function useEditCurrency(settings?: MutationSettings<editCurrencyParams, typeof editCurrency>) {
  return useMutation({
    mutationFn: (params: editCurrencyParams) => editCurrency(params),
    ...settings?.options,
  })
}
