import type { createBarcodesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createBarcode } from '@/api/requests'

export function useBarcodeCreate(settings?: MutationSettings<createBarcodesParams, typeof createBarcode>) {
  return useMutation({
    mutationFn: createBarcode,
    ...settings?.options,
  })
}
