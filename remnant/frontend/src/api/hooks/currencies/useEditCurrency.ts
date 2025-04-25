import type { editCurrencyParams } from '@/api/requests'

import { editCurrency } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useEditCurrency(settings?: MutationSettings<editCurrencyParams, typeof editCurrency>) {
  return useMutation({
    mutationFn: (params: editCurrencyParams) => editCurrency(params),
    ...settings?.options,
  })
}
