import type { CreateBarcodeRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createBarcode } from '@/api/requests'

export function useBarcodeCreate(settings?: MutationSettings<CreateBarcodeRequest>) {
  return useMutation({
    mutationFn: createBarcode,
    ...settings?.options,
  })
}
