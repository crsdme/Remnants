import type { duplicateCurrencyParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { duplicateCurrency } from '@/api/requests'

export function useCurrencyDuplicate(settings?: MutationSettings<duplicateCurrencyParams, typeof duplicateCurrency>) {
  return useMutation({
    mutationFn: duplicateCurrency,
    ...settings?.options,
  })
}
