import type { editBarcodeParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editBarcode } from '@/api/requests'

export function useEditBarcode(settings?: MutationSettings<editBarcodeParams, typeof editBarcode>) {
  return useMutation({
    mutationFn: (params: editBarcodeParams) => editBarcode(params),
    ...settings?.options,
  })
}
