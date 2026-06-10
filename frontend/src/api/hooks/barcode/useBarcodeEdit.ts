import type { EditBarcodeRequest } from '@remnant/shared'
import { useMutation } from '@tanstack/react-query'
import { editBarcode } from '@/api/requests'

export function useBarcodeEdit(settings?: MutationSettings<EditBarcodeRequest>) {
  return useMutation({
    mutationFn: editBarcode,
    ...settings?.options,
  })
}
