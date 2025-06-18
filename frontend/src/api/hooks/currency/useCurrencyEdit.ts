import type { editCurrencyParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editCurrency } from '@/api/requests'

export function useCurrencyEdit(settings?: MutationSettings<editCurrencyParams, typeof editCurrency>) {
  return useMutation({
    mutationFn: editCurrency,
    ...settings?.options,
  })
}
