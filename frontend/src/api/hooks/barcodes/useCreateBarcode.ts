import type { createBarcodesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createBarcode } from '@/api/requests'

export function useCreateBarcode(settings?: MutationSettings<createBarcodesParams, typeof createBarcode>) {
  return useMutation({
    mutationFn: (params: createBarcodesParams) => createBarcode(params),
    ...settings?.options,
  })
}
