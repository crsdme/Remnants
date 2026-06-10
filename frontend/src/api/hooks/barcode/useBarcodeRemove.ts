import type { RemoveBarcodesRequest } from '@remnant/shared'
import { useMutation } from '@tanstack/react-query'
import { removeBarcodes } from '@/api/requests'

export function useBarcodeRemove(settings?: MutationSettings<RemoveBarcodesRequest, typeof removeBarcodes>) {
  return useMutation({
    mutationFn: removeBarcodes,
    ...settings?.options,
  })
}
