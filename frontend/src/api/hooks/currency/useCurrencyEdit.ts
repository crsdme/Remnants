import type { EditCurrencyRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editCurrency } from '@/api/requests'

export function useCurrencyEdit(settings?: MutationSettings<EditCurrencyRequest>) {
  return useMutation({
    mutationFn: editCurrency,
    ...settings?.options,
  })
}
