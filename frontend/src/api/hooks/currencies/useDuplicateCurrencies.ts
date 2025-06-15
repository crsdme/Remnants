import type { duplicateCurrencyParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { duplicateCurrency } from '@/api/requests'

export function useDuplicateCurrencies(settings?: MutationSettings<duplicateCurrencyParams, typeof duplicateCurrency>) {
  return useMutation({
    mutationFn: (params: duplicateCurrencyParams) => duplicateCurrency(params),
    ...settings?.options,
  })
}
