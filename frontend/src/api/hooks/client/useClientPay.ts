import type { PayClientRequest } from '@remnant/shared'
import { useMutation } from '@tanstack/react-query'
import { payClient } from '@/api/requests'

export function useClientPay(settings?: MutationSettings<PayClientRequest, typeof payClient>) {
  return useMutation({
    mutationFn: payClient,
    ...settings?.options,
  })
}
