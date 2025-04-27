import type { duplicateCurrencyParams } from '@/api/requests'

import { duplicateCurrency } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useDuplicateCurrencies(settings?: MutationSettings<duplicateCurrencyParams, typeof duplicateCurrency>) {
  return useMutation({
    mutationFn: (params: duplicateCurrencyParams) => duplicateCurrency(params),
    ...settings?.options,
  })
}
