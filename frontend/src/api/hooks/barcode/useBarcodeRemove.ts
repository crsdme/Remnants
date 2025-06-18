import type { removeBarcodesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeBarcodes } from '@/api/requests'

export function useBarcodeRemove(settings?: MutationSettings<removeBarcodesParams, typeof removeBarcodes>) {
  return useMutation({
    mutationFn: removeBarcodes,
    ...settings?.options,
  })
}
