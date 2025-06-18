import type { editBarcodeParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editBarcode } from '@/api/requests'

export function useBarcodeEdit(settings?: MutationSettings<editBarcodeParams, typeof editBarcode>) {
  return useMutation({
    mutationFn: editBarcode,
    ...settings?.options,
  })
}
